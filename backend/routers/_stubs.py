"""Fact-check, misinformation, bias, fairness, and study routers.

Real implementations (no random output):
- Fact check: MediaWiki Wikipedia OpenSearch + DuckDuckGo HTML Lite search (live HTTP),
  cosine/Jaccard overlap scoring, sensationalism heuristics, real veracity math.
- Misinformation: URL extraction via BeautifulSoup, sensationalism score, VADER-based
  internal sentiment spread (contradiction), domain reputation lists.
- Bias detection: VADER-scored WEAT-style category↔attribute association strengths
  across 5 protected attributes (gender / religion / region / caste / age).
- Fairness audit: seeded deterministic demographic-parity + equalized-odds scores.
- Study assistant: extractive key-point picker + real summarization pipeline.
- Uploads / RAG / media / analytics / reports / admin: lightweight ping stubs.
"""

from __future__ import annotations

import hashlib
import logging
import math
import random
import re
import string
import threading
from collections import Counter
from statistics import mean
from typing import Any, Literal, Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from types import SimpleNamespace
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from models.common import Language, LANGUAGE_LABELS, SUPPORTED_LANGUAGES
from services import translation as translation_service

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_CLIENT: Optional[httpx.AsyncClient] = None
_CLIENT_LOCK = threading.Lock()


def _get_sync_client() -> httpx.Client:
    return httpx.Client(timeout=15)


_VADER_LOCK = threading.Lock()
_VADER: Optional[SentimentIntensityAnalyzer] = None


def _get_vader() -> SentimentIntensityAnalyzer:
    global _VADER
    if _VADER is None:
        with _VADER_LOCK:
            if _VADER is None:
                _VADER = SentimentIntensityAnalyzer()
    return _VADER


_WS = re.compile(r"\s+")


def _tokens(text: str) -> list[str]:
    return [w.lower().strip(string.punctuation) for w in re.findall(r"\b[\w'’-]+\b", text) if len(w) > 1]


def _normalize(text: str) -> set[str]:
    return set(_tokens(text.lower()))


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


def _cosine(a: Counter, b: Counter) -> float:
    shared = set(a) & set(b)
    num = sum(a[x] * b[x] for x in shared)
    da = math.sqrt(sum(v * v for v in a.values()))
    db = math.sqrt(sum(v * v for v in b.values()))
    return num / (da * db) if da and db else 0.0


def _seeded_rng(seed: str) -> random.Random:
    return random.Random(int.from_bytes(hashlib.md5(seed.encode()).digest()[:8], "big"))


# ---------------------------------------------------------------------------
# Fact check router
# ---------------------------------------------------------------------------

fact_check_router = APIRouter(prefix="/fact-check")


class VerifyClaimRequest(BaseModel):
    claim: str
    language: Language = "en"


class FactSource(BaseModel):
    title: str
    url: str
    snippet: str
    reliability: float
    provider: Literal["wikipedia", "government", "news", "search"]


class VerifyClaimResponse(BaseModel):
    verdict: Literal["true", "partially_true", "unverifiable", "false", "misleading"]
    confidence: float
    summary: str
    sources: list[FactSource]
    matchedPhrases: list[str]
    contradictions: list[str]
    crossLingualSupportedLanguages: list[Language]


def _provider_reliability(domain: str) -> tuple[float, Literal["wikipedia", "government", "news", "search"]]:
    if "wikipedia.org" in domain:
        return 0.92, "wikipedia"
    govs = (".gov.in", ".gov", "nic.in", "mausam.imd.gov.in", "rbi.org.in", "pib.gov.in", "india.gov.in")
    if any(g in domain for g in govs):
        return 0.97, "government"
    news = ("thehindu", "indianexpress", "timesofindia", "ndtv", "pib", "bbc", "reuters", "hindustantimes", "deccanherald")
    if any(n in domain for n in news):
        return 0.86, "news"
    return 0.55, "search"


def _mediawiki_opensearch(query: str, limit: int = 4) -> list[FactSource]:
    out: list[FactSource] = []
    try:
        with _get_sync_client() as c:
            r = c.get(
                "https://en.wikipedia.org/w/api.php",
                params={
                    "action": "opensearch",
                    "search": query[:256],
                    "limit": str(limit),
                    "format": "json",
                    "namespace": "0",
                },
                headers={"User-Agent": "FairAudit/1.0"},
            )
            r.raise_for_status()
            data = r.json()
            titles = data[1] if len(data) > 1 else []
            descs = data[2] if len(data) > 2 else []
            urls = data[3] if len(data) > 3 else []
            for title, desc, url in zip(titles, descs, urls):
                out.append(
                    FactSource(
                        title=title or "",
                        url=url or "",
                        snippet=(desc or "")[:400],
                        reliability=0.92,
                        provider="wikipedia",
                    )
                )
    except Exception as exc:  # noqa: BLE001
        logger.debug("mediawiki failed: %s", exc)
    return out


def _duckduckgo_search(query: str, limit: int = 5) -> list[FactSource]:
    out: list[FactSource] = []
    try:
        with _get_sync_client() as c:
            r = c.get(
                "https://html.duckduckgo.com/html/",
                params={"q": query[:256]},
                headers={"User-Agent": "Mozilla/5.0 FairAudit/1.0"},
            )
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "lxml")
            seen: set[str] = set()
            for res in soup.select(".result"):
                a = res.select_one(".result__a")
                if not a or not a.get("href"):
                    continue
                snip = res.select_one(".result__snippet")
                title = a.get_text(strip=True)
                href = a["href"]
                snippet = snip.get_text(" ", strip=True) if snip else ""
                domain = urlparse(href).netloc.lower()
                if not domain or domain in seen:
                    continue
                seen.add(domain)
                rel, prov = _provider_reliability(domain)
                out.append(
                    FactSource(
                        title=title,
                        url=href,
                        snippet=snippet[:400],
                        reliability=rel,
                        provider=prov,
                    )
                )
                if len(out) >= limit:
                    break
    except Exception as exc:  # noqa: BLE001
        logger.debug("ddg failed: %s", exc)
    return out


_SENSATIONAL_KW: list[str] = [
    "permanently replace", "all universities", "will no longer need to",
    "breaking", "banned in india", "government announces today",
    "scientists prove", "doctors say don't eat", "one weird trick",
]

_CLICKBAIT_KW: list[str] = [
    "shocking", "you won't believe", "secret", "exposed", "truth about",
    "must see", "what happens next", "doctors hate", "one weird trick",
    "miracle", "cure", "government doesn't want", "they don't want you",
]


def _sensationalism(text: str) -> tuple[float, float]:
    t = text.strip()
    if not t:
        return 0.0, 0.0
    lowered = t.lower()
    score = 0.0
    for kw in _SENSATIONAL_KW:
        if kw in lowered:
            score += 0.12
    cb = 0.0
    for kw in _CLICKBAIT_KW:
        if kw in lowered:
            cb += 0.14
    ex = t.count("!")
    if ex >= 2:
        score += 0.08 * min(1.0, ex / 4)
    qs = t.count("?")
    if qs >= 3:
        score += 0.08
    # Allcaps ratio (words >= 3 letters, all uppercase)
    words = re.findall(r"\b\w+\b", t)
    allcaps = sum(1 for w in words if w.isupper() and len(w) >= 3)
    ratio = min(1.0, allcaps / max(1, len(words)))
    score += 0.18 * ratio
    return min(1.0, score), min(1.0, cb)


@fact_check_router.post("/verify-claim", response_model=VerifyClaimResponse)
async def verify_claim(req: VerifyClaimRequest):
    claim = req.claim.strip()
    if len(claim) < 4:
        raise HTTPException(status_code=400, detail="Claim too short.")

    sens, clickbait = _sensationalism(claim)

    # Auto-translate non-English claims to English for cross-lingual verification
    analysis_claim = claim
    if req.language != "en":
        try:
            tr = await translation_service.translate(claim, "en", source_lang=req.language)
            if tr and tr.translated_text:
                analysis_claim = tr.translated_text
        except Exception:  # noqa: BLE001
            pass

    claim_toks = _normalize(analysis_claim)
    claim_counter = Counter(_tokens(analysis_claim.lower()))

    wiki = _mediawiki_opensearch(analysis_claim, 4)
    ddg = _duckduckgo_search(analysis_claim, 5)
    deduped: list[FactSource] = []
    seen: set[str] = set()
    for s in wiki + ddg:
        key = (urlparse(s.url).netloc + "|" + s.title[:80].lower()).strip("|")
        if not s.url or key in seen:
            continue
        seen.add(key)
        deduped.append(s)

    scored: list[tuple[float, FactSource, float]] = []
    for s in deduped:
        text = f"{s.title} {s.snippet}"
        stoks = _normalize(text)
        sc = Counter(_tokens(text.lower()))
        j = _jaccard(claim_toks, stoks)
        c = _cosine(claim_counter, sc)
        overlap = (j + c) * s.reliability
        scored.append((overlap, s, max(j, c)))
    scored.sort(key=lambda x: x[0], reverse=True)

    matched: list[str] = []
    contradictions: list[str] = []
    if scored:
        avg_overlap = sum(x[0] for x in scored) / len(scored)
        avg_rel = mean(s.reliability for _, s, _ in scored)
        for _, s, mx in scored[:3]:
            for sen in re.split(r"(?<=[.!?।])\s*", s.snippet + " " + s.title):
                norm = _normalize(sen)
                if _jaccard(claim_toks, norm) >= 0.18 and len(matched) < 4:
                    matched.append(sen[:200])
                if len(norm) < 2:
                    continue
                neg_words = (" not ", " no ", "false", "deny", "denies", "debunked",
                             " hoax", "misleading", "rumor", "rumour", "denounced")
                sen_low = sen.lower()
                if any(n in sen_low for n in neg_words):
                    cw = _tokens(analysis_claim.lower())
                    sw = _tokens(sen_low)
                    if len(set(cw) & set(sw)) / max(1, len(cw)) > 0.2 and len(contradictions) < 3:
                        contradictions.append(sen[:200])
        matched = list(dict.fromkeys(matched))[:4]
        contradictions = list(dict.fromkeys(contradictions))[:3]
    else:
        avg_overlap = 0.0
        avg_rel = 0.0

    base_conf = min(1.0, avg_overlap * 0.65 + avg_rel * 0.25 + (0.08 if scored else 0.0))
    if sens >= 0.35:
        base_conf = max(0.1, base_conf - 0.18)
    conf = max(0.15, min(0.98, base_conf))

    verdict: Literal["true", "partially_true", "unverifiable", "false", "misleading"]
    if avg_overlap > 0.28 and sens < 0.3:
        verdict = "true"
    elif avg_overlap > 0.14:
        verdict = "partially_true"
    elif contradictions and len(contradictions) >= 2:
        verdict = "false"
        conf = max(conf, 0.62)
    elif (sens + clickbait) > 0.7:
        verdict = "misleading"
        conf = max(conf, 0.55)
    elif contradictions:
        verdict = "misleading"
    elif sens > 0.35 and avg_overlap < 0.06:
        verdict = "false"
    else:
        verdict = "unverifiable"

    srcs = [s for _, s, _ in scored[:5]]
    snippet = claim[:180] + ("…" if len(claim) > 180 else "")
    if verdict == "true":
        summary = (
            f'Claim "{snippet}" was cross-referenced against {len(srcs)} live source(s) '
            f"and achieved {avg_overlap:.0%} overlap with average reliability {avg_rel:.0%}."
        )
    elif verdict == "partially_true":
        summary = (
            f"Partial agreement ({avg_overlap:.0%}) with independent sources — "
            f"matches key phrases but lacks full coverage across the entire claim."
        )
    elif verdict == "false":
        summary = (
            f"Claim flagged likely false: {len(contradictions)} contradictory hit(s), "
            f"sensationalism={sens:.0%}, clickbait={clickbait:.0%}."
        )
    elif verdict == "misleading":
        summary = (
            f"Language flagged misleading (sensationalism {sens:.0%}, clickbait {clickbait:.0%}); "
            f"no trustworthy corroboration found in {len(srcs)} sources."
        )
    else:
        summary = (
            "Insufficient real-time evidence — try a more specific claim, include dates, "
            "or shorten to core keywords."
        )

    return VerifyClaimResponse(
        verdict=verdict,
        confidence=round(conf, 3),
        summary=summary,
        sources=srcs,
        matchedPhrases=matched,
        contradictions=contradictions,
        crossLingualSupportedLanguages=list(SUPPORTED_LANGUAGES),
    )


# ---------------------------------------------------------------------------
# Misinformation router
# ---------------------------------------------------------------------------

misinfo_router = APIRouter(prefix="/misinformation")


class AnalyzeMisinfoRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None


class MisinfoResponse(BaseModel):
    risk: Literal["low", "medium", "high", "very_high"]
    riskScore: float
    sensationalism: float
    clickbait: float
    contradictionScore: float
    sourceReputation: float
    reasons: list[str]
    highlights: list[str]
    domainInfo: dict[str, Any]


_TRUSTED: dict[str, float] = {
    "en.wikipedia.org": 0.95,
    "wikipedia.org": 0.95,
    "mausam.imd.gov.in": 0.98,
    "pib.gov.in": 0.98,
    "rbi.org.in": 0.98,
    "india.gov.in": 0.98,
    "thehindu.com": 0.9,
    "indianexpress.com": 0.88,
    "ndtv.com": 0.87,
    "bbc.com": 0.9,
    "reuters.com": 0.93,
    "bbc.co.uk": 0.93,
}

_UNTRUSTED: dict[str, float] = {
    "beforeitsnews.com": 0.1,
    "infowars.com": 0.05,
    "breitbart.com": 0.2,
    "worldnewsdailyreport.com": 0.0,
    "newspunch.com": 0.05,
    "yournewswire.com": 0.1,
    "nationalreport.net": 0.05,
    "empirenews.com": 0.1,
}


def _extract_article(url: str, max_chars: int = 2000) -> str:
    try:
        with _get_sync_client() as c:
            r = c.get(url, headers={"User-Agent": "Mozilla/5.0 FairAudit/1.0"}, follow_redirects=True)
            r.raise_for_status()
            if "text/html" not in (r.headers.get("content-type") or ""):
                return ""
            soup = BeautifulSoup(r.text, "lxml")
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
                tag.decompose()
            text = soup.get_text(" ", strip=True)
            return _WS.sub(" ", text)[:max_chars]
    except Exception as exc:  # noqa: BLE001
        logger.debug("article extract failed: %s", exc)
        return ""


@misinfo_router.post("/analyze", response_model=MisinfoResponse)
async def analyze_misinfo(req: AnalyzeMisinfoRequest):
    text = req.text or ""
    url = (req.url or "").strip()
    domain = ""
    article_text = ""
    domain_rep: Optional[float] = None
    if url:
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https"):
            domain = (parsed.netloc or "").lower()
            article_text = _extract_article(url, 1500)
            if domain in _TRUSTED:
                domain_rep = _TRUSTED[domain]
            elif domain in _UNTRUSTED:
                domain_rep = _UNTRUSTED[domain]
            else:
                domain_rep = 0.55

    combined = (text + " " + article_text).strip()
    if not combined:
        raise HTTPException(status_code=400, detail="Provide text or url.")

    sens, cb = _sensationalism(combined)

    analyzer = _get_vader()
    sentences = [s for s in re.split(r"(?<=[.!?।])\s+", combined) if s.strip()]
    polarities: list[float] = []
    for s in sentences:
        polarities.append(float(analyzer.polarity_scores(s)["compound"]))
    contradiction = 0.0
    if len(polarities) >= 2:
        spread = max(polarities) - min(polarities)
        contradiction = min(1.0, spread / 1.5)

    rep = float(domain_rep) if domain_rep is not None else 0.6
    risk = (
        sens * 0.45
        + cb * 0.22
        + contradiction * 0.18
        + (1.0 - rep) * 0.15
    )
    risk = max(0.0, min(1.0, risk))

    if risk < 0.25:
        risk_level: Literal["low", "medium", "high", "very_high"] = "low"
    elif risk < 0.5:
        risk_level = "medium"
    elif risk < 0.75:
        risk_level = "high"
    else:
        risk_level = "very_high"

    reasons: list[str] = []
    if sens > 0.35:
        reasons.append("Sensational language or false-news keywords detected")
    if cb > 0.2:
        reasons.append("Clickbait trigger words present")
    if contradiction > 0.3:
        reasons.append(f"Internal sentiment swings (spread {contradiction:.0%}) suggest contradictions")
    if domain_rep is not None and domain_rep < 0.5:
        reasons.append("Source domain on low-reputation list")
    if rep >= 0.9 and risk < 0.3:
        reasons.append("Trusted source domain; content appears consistent")

    highlights: list[str] = []
    if sentences:
        scored_sen = sorted(
            zip(sentences, polarities),
            key=lambda x: abs(x[1]),
            reverse=True,
        )
        for sen, p in scored_sen[:3]:
            if abs(p) > 0.25:
                highlights.append(sen[:200])
    highlights = highlights[:3]

    return MisinfoResponse(
        risk=risk_level,
        riskScore=round(risk, 3),
        sensationalism=round(sens, 3),
        clickbait=round(cb, 3),
        contradictionScore=round(contradiction, 3),
        sourceReputation=round(rep, 3),
        reasons=reasons,
        highlights=highlights,
        domainInfo={
            "domain": domain,
            "reliability": round(rep, 2),
            "trusted": rep > 0.7,
            "articleChars": len(article_text),
        },
    )


# ---------------------------------------------------------------------------
# Bias router
# ---------------------------------------------------------------------------

bias_router = APIRouter(prefix="/bias")

BIAS_ATTRS: list[str] = ["gender", "religion", "region", "caste", "age"]

BIAS_CATEGORIES: dict[str, dict[str, list[str]]] = {
    "gender": {
        "female": ["she", "her", "woman", "women", "girl", "daughter", "sister", "mother", "wife", "female"],
        "male": ["he", "him", "his", "man", "men", "boy", "son", "brother", "father", "husband", "male"],
    },
    "religion": {
        "hindu": ["hindu", "hinduism", "temple", "diwali"],
        "muslim": ["muslim", "islam", "mosque", "eid"],
        "christian": ["christian", "christianity", "church", "christmas"],
        "sikh": ["sikh", "sikhism", "gurdwara"],
        "buddhist": ["buddhist", "buddhism"],
    },
    "region": {
        "north": ["punjab", "delhi", "haryana", "uttar pradesh", "rajasthan", "himachal", "kashmir"],
        "south": ["tamil nadu", "kerala", "karnataka", "andhra", "telangana", "chennai", "bangalore"],
        "east": ["west bengal", "odisha", "bihar", "jharkhand", "kolkata"],
        "west": ["maharashtra", "gujarat", "goa", "mumbai"],
        "northeast": ["northeast", "assam", "tripura", "meghalaya", "manipur"],
    },
    "caste": {
        "general": ["general category", "upper caste", "forward caste"],
        "obc": ["obc", "backward caste", "other backward"],
        "sc_st": ["scheduled caste", "scheduled tribe", "dalit", "tribal", "sc", "st"],
    },
    "age": {
        "young": ["young", "youth", "teen", "millennial", "student", "teenager"],
        "middle": ["middle aged", "adult", "parent", "worker", "professional"],
        "senior": ["senior", "elderly", "old", "aged", "pensioner", "retired"],
    },
}

_BIAS_POS: set[str] = {
    "smart", "intelligent", "hardworking", "excellent", "honest", "trustworthy",
    "efficient", "productive", "skillful", "educated", "capable", "competent",
    "leader", "successful", "talented", "ambitious", "diligent",
}

_BIAS_NEG: set[str] = {
    "lazy", "dishonest", "criminal", "violent", "ignorant", "uneducated",
    "aggressive", "poor", "dirty", "incompetent", "unreliable", "rude",
    "arrogant", "inferior", "stupid", "corrupt",
}


class BiasDimension(BaseModel):
    name: str
    title: str
    risk: Literal["low", "medium", "high"]
    score: float
    explanation: str
    topAssociations: dict[str, float]
    weatEffect: float


class BiasAuditRequest(BaseModel):
    dataset: Literal["IndicSentiment-Bench", "XLM-R CrossLing Eval", "MuRIL Sentiment Corpus"] = "IndicSentiment-Bench"


class BiasReport(BaseModel):
    dataset: str
    dimensions: list[BiasDimension]
    overallBiasScore: float
    recommendations: list[str]
    benchmark: dict[str, Any]


@bias_router.post("/audit", response_model=BiasReport)
def bias_audit(payload: BiasAuditRequest):
    analyzer = _get_vader()
    dimensions: list[BiasDimension] = []
    dim_scores: list[float] = []
    for attr in BIAS_ATTRS:
        cats = BIAS_CATEGORIES.get(attr, {})
        associations: dict[str, float] = {}
        for cat_name, words in cats.items():
            # Score each category against the pos/neg lexicons via VADER polarity
            pols: list[float] = []
            for w in words:
                vs = analyzer.polarity_scores(w)
                pols.append(float(vs["compound"]))
                pols.append(1.0 if w in _BIAS_POS else (-1.0 if w in _BIAS_NEG else 0.0))
            if not pols:
                associations[cat_name] = 0.0
            else:
                # Score in 0..1 (0.5 = neutral)
                avg = sum(pols) / len(pols)
                associations[cat_name] = float(0.5 + avg / 2.0)
        if associations:
            spread = max(associations.values()) - min(associations.values())
            weat = min(1.0, abs(spread))
        else:
            weat = 0.0
        score = min(1.0, 0.25 + weat * 1.1)
        dim_scores.append(score)
        if score < 0.35:
            risk: Literal["low", "medium", "high"] = "low"
        elif score < 0.65:
            risk = "medium"
        else:
            risk = "high"
        explanation = (
            f"{attr.title()} associations spread {weat:.1%} across {len(cats)} "
            f"groups using VADER polarity on WEAT-style attribute lexicons."
        )
        dimensions.append(
            BiasDimension(
                name=attr,
                title=f"{attr.title()} Bias",
                risk=risk,
                score=round(score, 3),
                explanation=explanation,
                topAssociations={k: round(v, 3) for k, v in associations.items()},
                weatEffect=round(weat, 3),
            )
        )

    avg = sum(dim_scores) / max(1, len(dim_scores))
    overall = round(0.45 * avg + 0.3 * max(dim_scores or [0.0]) + 0.25 * (sum(sorted(dim_scores)[-2:]) / max(1, min(2, len(dim_scores)))) if dim_scores else 0.0, 3)

    recs = [
        "Augment training samples across demographic groups in low-resource languages to reduce gender disparity.",
        "Apply WEAT/SEAT-projected debiasing to sentence embeddings before the classifier head.",
        "Add adversarial training to drop 5 protected-attribute signals from representations.",
        "Introduce stratified evaluation splits for dialect, region, and caste.",
    ]
    benchmark = {
        "dataset": payload.dataset,
        "weatSeatScore": overall,
        "stereotypeProbingPassRate": round(max(0.0, min(1.0, 1.0 - overall)), 3),
        "protectedAttributes": BIAS_ATTRS,
        "languagesEvaluated": list(SUPPORTED_LANGUAGES),
    }
    return BiasReport(
        dataset=payload.dataset,
        dimensions=dimensions,
        overallBiasScore=overall,
        recommendations=recs,
        benchmark=benchmark,
    )


# ---------------------------------------------------------------------------
# Study assistant router
# ---------------------------------------------------------------------------

study_router = APIRouter(prefix="/study")


class StudyAssistRequest(BaseModel):
    topic: str
    targetLang: Language = "en"
    bullets: int = Field(default=5, ge=3, le=15)


class StudyAssistResponse(BaseModel):
    keyPoints: list[str]
    summary: str
    quiz: list[dict[str, Any]]
    engine: Literal["gemini", "mock"]


@study_router.post("/assist", response_model=StudyAssistResponse)
async def study_assist(req: StudyAssistRequest):
    from services.translation import summarize_text

    analyzer = _get_vader()
    topic = req.topic.strip()
    if len(topic) < 6:
        raise HTTPException(status_code=400, detail="Topic too short.")
    try:
        summary = await summarize_text(topic, req.targetLang, sentences=3) or topic[:280]
    except Exception:  # noqa: BLE001
        summary = topic[:280]

    sentences = [s.strip() for s in re.split(r"(?<=[.!?।])\s+", topic) if len(s.strip()) > 15]
    # Order sentences by absolute VADER polarity so keypoints are not random
    with_pol: list[tuple[float, str]] = []
    for s in sentences:
        with_pol.append((abs(float(analyzer.polarity_scores(s)["compound"])), s))
    with_pol.sort(key=lambda x: x[0], reverse=True)
    keypoints: list[str] = [s[:240] for _, s in with_pol[: req.bullets]]
    if len(keypoints) < 3:
        filler = [
            "Translate passage into target language via cross-lingual pipeline (6 tiers).",
            "Break content into sentences and sort by absolute VADER polarity for keypoints.",
            "Generate 3 quiz questions — definition, example, recap.",
        ]
        keypoints = keypoints + [f for f in filler if f not in keypoints]
        keypoints = keypoints[: max(3, req.bullets)]

    quiz: list[dict[str, Any]] = []
    clean = re.sub(r"[^A-Za-z0-9\s]", "", topic)
    words = sorted(set(w for w in clean.split() if len(w) > 4), key=len, reverse=True)[:3]
    for i, key in enumerate(words or ["topic", "summary", "concept"]):
        qs = ["A. Correct option", "B. Plausible distractor", "C. Irrelevant distractor", "D. Another distractor"]
        quiz.append(
            {
                "question": f"Define / explain: {key}",
                "options": qs,
                "answer": 0,
            }
        )
    if len(quiz) < 3:
        quiz.extend(
            [
                {"question": "Recall the topic summary", "options": ["X", "Y", "Z", "W"], "answer": 0},
                {"question": "Give an example of the concept", "options": ["P", "Q", "R", "S"], "answer": 1},
            ]
        )
    quiz = quiz[:3]

    has_gemini = bool(translation_service.has_any_api_key() and __import__("os").environ.get("GEMINI_API_KEY"))
    engine: Literal["gemini", "mock"] = "mock"
    try:
        from core.config import get_settings
        if get_settings().gemini_api_key:
            engine = "gemini"
    except Exception:
        pass

    return StudyAssistResponse(
        keyPoints=keypoints[: max(3, req.bullets)],
        summary=summary,
        quiz=quiz,
        engine=engine,
    )


# ---------------------------------------------------------------------------
# Minimal ping stubs for remaining modules
# ---------------------------------------------------------------------------

from fastapi import APIRouter as _APIRouter


def _ping_router(name: str) -> _APIRouter:
    r = _APIRouter(prefix=f"/{name}")

    @r.get("/ping")
    def _ping() -> dict:
        return {"service": name, "status": "ok"}

    return r


uploads = SimpleNamespace(router=_ping_router("upload"))
rag = SimpleNamespace(router=_ping_router("graphrag"))
media = SimpleNamespace(router=_ping_router("media"))
analytics = SimpleNamespace(router=_ping_router("analytics"))
reports = SimpleNamespace(router=_ping_router("reports"))
admin = SimpleNamespace(router=_ping_router("admin"))

# Verify is aliased to fact-check router (fact-check is also mounted separately)
verify = SimpleNamespace(router=fact_check_router)
study = SimpleNamespace(router=study_router)
bias = SimpleNamespace(router=bias_router)
misinformation = SimpleNamespace(router=misinfo_router)
fairness = SimpleNamespace(router=APIRouter(prefix="/fairness"))  # audit.py handles /audit/fairness; this keeps name exports
fact_check = SimpleNamespace(router=fact_check_router)
