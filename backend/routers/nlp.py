"""NLP Router — real language detection · translation · sentiment · emotion.

- Translation: 6 tiers (Google Translate free → MyMemory → Linguee →
  LibreTranslate → IndicTrans2/GoogleCloud/Gemini paid → offline dict).
- Language detection: real langdetect library with ISO-639-1 → Language mapping.
- Sentiment: real VADER for English + translated-to-English pipeline for all
  other 13 languages via the translate() chain.
- Emotion: rule-based lexicon over English text, via translation when needed.
"""

from __future__ import annotations

import asyncio
import logging
import random
import re
import string
import threading
from collections import Counter
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from langdetect import detect, detect_langs, LangDetectException
from pydantic import BaseModel, Field
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from core.config import get_settings
from models.common import Language, LANGUAGE_LABELS, SUPPORTED_LANGUAGES
from services import translation as translation_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/nlp")

_VADER_LOCK = threading.Lock()
_VADER: Optional[SentimentIntensityAnalyzer] = None


def _get_vader() -> SentimentIntensityAnalyzer:
    global _VADER
    if _VADER is None:
        with _VADER_LOCK:
            if _VADER is None:
                _VADER = SentimentIntensityAnalyzer()
    return _VADER


_ISO_TO_LANG: dict[str, Language] = {
    "en": "en", "hi": "hi", "bn": "bn", "te": "te", "mr": "mr", "ta": "ta",
    "ur": "ur", "gu": "gu", "kn": "kn", "ml": "ml", "or": "or", "pa": "pa",
    "as": "as", "sa": "sa",
    # langdetect may return macro / variants
    "eng": "en", "hin": "hi", "ben": "bn", "tel": "te", "mar": "mr", "tam": "ta",
    "urd": "ur", "guj": "gu", "kan": "kn", "mal": "ml", "ori": "or", "pan": "pa",
    "asm": "as",
}


def _script_hint(text: str) -> Optional[Language]:
    """Use Unicode ranges as hints for Devanagari / Bengali / Telugu etc.

    langdetect can occasionally misclassify short samples. This function
    provides a deterministic override for obvious pure-script inputs.
    """
    ranges = [
        ("hi", 0x0900, 0x097F),   # Devanagari
        ("mr", 0x0900, 0x097F),
        ("sa", 0x0900, 0x097F),
        ("bn", 0x0980, 0x09FF),   # Bengali (also Assamese)
        ("as", 0x0980, 0x09FF),
        ("pa", 0x0A00, 0x0A7F),   # Gurmukhi
        ("gu", 0x0A80, 0x0AFF),   # Gujarati
        ("or", 0x0B00, 0x0B7F),   # Oriya
        ("ta", 0x0B80, 0x0BFF),   # Tamil
        ("te", 0x0C00, 0x0C7F),   # Telugu
        ("kn", 0x0C80, 0x0CFF),   # Kannada
        ("ml", 0x0D00, 0x0D7F),   # Malayalam
        ("ur", 0x0600, 0x06FF),   # Arabic (Urdu)
    ]
    counts: Counter[str] = Counter()
    for ch in text:
        cp = ord(ch)
        for code, lo, hi in ranges:
            if lo <= cp <= hi:
                counts[code] += 1
    if not counts:
        return None
    top_code, n = counts.most_common(1)[0]
    if n / max(1, len(text)) > 0.25:
        return top_code  # type: ignore[return-value]
    return None


# ---------------------------------------------------------------------------
# Language detection (real)
# ---------------------------------------------------------------------------
class LangDetectRequest(BaseModel):
    text: str = Field(min_length=1)


class LangDetectResponse(BaseModel):
    language: Language
    languageName: str
    confidence: float
    supported: list[Language]


@router.post("/language-detect", response_model=LangDetectResponse)
def detect_language(req: LangDetectRequest):
    text = req.text.strip()
    supported = list(SUPPORTED_LANGUAGES)

    # 1) Unicode script hint for obvious Indic text
    hint = _script_hint(text)
    if hint is not None and hint in supported and len(text) < 40:
        return LangDetectResponse(
            language=hint,
            languageName=LANGUAGE_LABELS[hint],
            confidence=0.91,
            supported=supported,
        )

    # 2) Real langdetect library with probability list
    try:
        best: Optional[tuple[Language, float]] = None
        for item in detect_langs(text):
            iso = item.lang.split("-")[0].lower()
            code = _ISO_TO_LANG.get(iso)
            if code is None or code not in supported:
                continue
            if best is None or item.prob > best[1]:
                best = (code, float(item.prob))
        if best is None:
            # fallback: single-tone detect()
            iso = detect(text).split("-")[0].lower()
            code = _ISO_TO_LANG.get(iso)
            if code is not None and code in supported:
                return LangDetectResponse(
                    language=code,
                    languageName=LANGUAGE_LABELS[code],
                    confidence=0.78,
                    supported=supported,
                )
        else:
            language, confidence = best
            return LangDetectResponse(
                language=language,
                languageName=LANGUAGE_LABELS[language],
                confidence=round(max(0.5, confidence), 3),
                supported=supported,
            )
    except (LangDetectException, Exception) as exc:  # noqa: BLE001
        logger.debug("langdetect failed, using script hint: %s", exc)

    # 3) Final fallback: script hint or "en"
    fallback = hint or "en"
    return LangDetectResponse(
        language=fallback,
        languageName=LANGUAGE_LABELS[fallback],
        confidence=0.6,
        supported=supported,
    )


# ---------------------------------------------------------------------------
# Translation — 6 tiers (see services/translation.py)
# ---------------------------------------------------------------------------
class TranslationRequest(BaseModel):
    text: str
    targetLang: Language
    sourceLang: Optional[Language] = None
    context: Optional[str] = None


_TranslationEngineT = Literal[
    "indictrans2", "googlecloud", "google", "mymemory", "linguee",
    "libretranslate", "gemini", "noop", "mock",
]


class TranslationResponse(BaseModel):
    sourceLanguage: Language
    targetLanguage: Language
    originalText: str
    translatedText: str
    confidence: float
    engine: _TranslationEngineT


@router.post("/translate", response_model=TranslationResponse)
async def translate(req: TranslationRequest):
    result = await translation_service.translate(
        text=req.text,
        target_lang=req.targetLang,
        source_lang=req.sourceLang,
        context=req.context,
    )

    if result is None:
        raise HTTPException(
            status_code=424,
            detail=(
                "All translation tiers failed for this language pair. "
                "Verify network connectivity and retry."
            ),
        )

    allowed = {
        "indictrans2", "googlecloud", "google", "mymemory", "linguee",
        "libretranslate", "gemini", "noop", "mock",
    }
    engine: _TranslationEngineT = (
        result.engine if result.engine in allowed else "mock"  # type: ignore[assignment]
    )

    return TranslationResponse(
        sourceLanguage=result.source_language,
        targetLanguage=result.target_language,
        originalText=result.original_text,
        translatedText=result.translated_text,
        confidence=result.confidence,
        engine=engine,
    )


# ---------------------------------------------------------------------------
# Explain translation + summarize
# ---------------------------------------------------------------------------
class ExplainTranslationRequest(BaseModel):
    originalText: str
    translatedText: str
    sourceLang: Language
    targetLang: Language


class ExplainTranslationResponse(BaseModel):
    explanation: str
    engine: Literal["gemini", "mock"]


@router.post("/translate/explain", response_model=ExplainTranslationResponse)
async def explain_translation(req: ExplainTranslationRequest):
    explanation = await translation_service.explain_translation(
        original_text=req.originalText,
        translated_text=req.translatedText,
        source_lang=req.sourceLang,
        target_lang=req.targetLang,
    )
    if not explanation:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is not set in backend/.env (required for translation explanations).",
        )
    has_gemini = bool(get_settings().gemini_api_key)
    return ExplainTranslationResponse(
        explanation=explanation, engine="gemini" if has_gemini else "mock"
    )


class SummarizeRequest(BaseModel):
    text: str = Field(min_length=1)
    targetLang: Language = "en"
    sentences: int = Field(default=3, ge=1, le=10)


class SummarizeResponse(BaseModel):
    summary: str
    engine: Literal["gemini", "mock"]


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(req: SummarizeRequest):
    summary = await translation_service.summarize_text(
        text=req.text,
        target_lang=req.targetLang,
        sentences=req.sentences,
    )
    if not summary:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is not set in backend/.env (required for summarization).",
        )
    has_gemini = bool(get_settings().gemini_api_key)
    return SummarizeResponse(summary=summary, engine="gemini" if has_gemini else "mock")


# ---------------------------------------------------------------------------
# Sentiment (real VADER with auto-translate for non-English)
# ---------------------------------------------------------------------------
class SentimentRequest(BaseModel):
    text: str
    language: Language = "en"


class WordCloudEntry(BaseModel):
    text: str
    value: int


class SentimentResponse(BaseModel):
    label: Literal["positive", "neutral", "negative"]
    score: float
    probabilities: dict[str, float]
    positiveWords: list[str]
    negativeWords: list[str]
    wordCloud: list[WordCloudEntry]


_POSITIVE_LEXICON: set[str] = {
    "good", "great", "excellent", "amazing", "wonderful", "awesome", "love",
    "best", "better", "happy", "joy", "fantastic", "outstanding", "perfect",
    "beautiful", "brilliant", "nice", "pleasant", "positive", "impressive",
    "delightful", "superb", "like", "success", "successful", "win", "won",
    "favorite", "recommend", "strong", "clean", "fresh", "helpful", "honest",
    "innovative", "efficient", "quality", "value", "reliable", "professional",
}

_NEGATIVE_LEXICON: set[str] = {
    "bad", "terrible", "awful", "horrible", "worst", "hate", "dislike",
    "sad", "angry", "disappointing", "disappointed", "poor", "weak", "fail",
    "failed", "failure", "broken", "ugly", "boring", "negative", "wrong",
    "slow", "dirty", "expensive", "useless", "waste", "scam", "fraud",
    "corrupt", "horror", "painful", "mediocre", "rude", "arrogant", "late",
    "missing", "defective", "noise", "noisy", "unprofessional",
}


def _tokenize_words(text: str) -> list[str]:
    return [w.lower().strip(string.punctuation) for w in re.findall(r"\b\w+\b", text)]


def _build_wordcloud(text: str, pos_words: list[str], neg_words: list[str]) -> list[WordCloudEntry]:
    counts = Counter(_tokenize_words(text))
    entries: list[WordCloudEntry] = []
    # prioritize sentiment-carrying words
    for w in pos_words + neg_words:
        if w in counts and counts[w] > 0:
            entries.append(WordCloudEntry(text=w, value=min(50, 5 + counts[w] * 3)))
            del counts[w]
    # add a few frequent neutral words
    for w, c in counts.most_common(12):
        if len(w) < 3:
            continue
        entries.append(WordCloudEntry(text=w, value=min(30, 3 + c * 2)))
        if len(entries) >= 15:
            break
    return entries


@router.post("/sentiment", response_model=SentimentResponse)
async def sentiment(req: SentimentRequest):
    text = req.text.strip()
    language: Language = req.language or "en"

    # Auto-detect language if user sent "en" but it's clearly another script
    if language == "en":
        hint = _script_hint(text)
        if hint and hint != "en":
            language = hint

    # For non-English: translate to English via the live translation chain
    if language != "en":
        try:
            translated = await translation_service.translate(
                text=text,
                target_lang="en",
                source_lang=language,
            )
            analysis_text = translated.translated_text if translated else text
        except Exception:  # noqa: BLE001
            analysis_text = text
    else:
        analysis_text = text

    # VADER polarity (real)
    analyzer = _get_vader()
    vs = analyzer.polarity_scores(analysis_text)
    compound = float(vs["compound"])
    pos = float(vs["pos"])
    neu = float(vs["neu"])
    neg = float(vs["neg"])

    # Lexicon-based positive/negative word lists
    words = _tokenize_words(analysis_text)
    positive_words = sorted({w for w in words if w in _POSITIVE_LEXICON})
    negative_words = sorted({w for w in words if w in _NEGATIVE_LEXICON})

    if not positive_words and pos > 0.15:
        positive_words = ["positive sentiment"]
    if not negative_words and neg > 0.15:
        negative_words = ["negative sentiment"]

    if compound >= 0.05:
        label: Literal["positive", "neutral", "negative"] = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    # Normalize probabilities so they sum to 1.0
    total = pos + neg + neu or 1.0
    probabilities = {
        "positive": round(pos / total, 3),
        "neutral": round(neu / total, 3),
        "negative": round(neg / total, 3),
    }

    word_cloud = _build_wordcloud(analysis_text, positive_words, negative_words)
    # Shuffle words so the list doesn't always begin with the same polarity
    random.Random(hash(text) & 0xFFFF).shuffle(word_cloud)

    return SentimentResponse(
        label=label,
        score=round(compound, 3),
        probabilities=probabilities,
        positiveWords=positive_words,
        negativeWords=negative_words,
        wordCloud=word_cloud,
    )


# ---------------------------------------------------------------------------
# Emotion (real VADER + rule-based lexicon)
# ---------------------------------------------------------------------------
class EmotionRequest(BaseModel):
    text: str
    language: Language = "en"


class EmotionResponse(BaseModel):
    primary: Literal["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]
    scores: dict[str, float]
    topWords: dict[str, list[str]]


_EMOTION_LEXICON: dict[str, dict[str, set[str]]] = {
    "joy": {"words": {
        "happy", "joy", "love", "delight", "excited", "smile", "cheerful",
        "wonderful", "fantastic", "awesome", "grateful", "blessed",
        "celebrate", "great", "amazing", "excellent", "perfect", "thrilled",
        "fun", "enjoy", "pleased", "proud",
    }},
    "sadness": {"words": {
        "sad", "cry", "tears", "grief", "heartbroken", "lonely", "depressed",
        "upset", "miserable", "sorry", "regret", "disappointed", "lost",
        "pain", "hurt", "melancholy",
    }},
    "anger": {"words": {
        "angry", "mad", "furious", "rage", "hate", "annoyed", "frustrated",
        "irritated", "outraged", "resentful", "disgusted", "violent",
        "shouting", "protest", "wrath",
    }},
    "fear": {"words": {
        "afraid", "scared", "fear", "worried", "anxious", "terrified",
        "panic", "horror", "dread", "threat", "danger", "panic", "nervous",
    }},
    "surprise": {"words": {
        "surprise", "shocked", "wow", "unbelievable", "amazed", "astonished",
        "stunned", "unexpected", "incredible", "remarkable",
    }},
    "disgust": {"words": {
        "disgust", "gross", "nauseating", "repulsive", "vile", "sickening",
        "revolting", "horrid", "awful", "filthy",
    }},
}


@router.post("/emotion", response_model=EmotionResponse)
async def emotion(req: EmotionRequest):
    text = req.text.strip()
    language = req.language or "en"
    if language == "en":
        hint = _script_hint(text)
        if hint and hint != "en":
            language = hint
    if language != "en":
        try:
            translated = await translation_service.translate(
                text=text,
                target_lang="en",
                source_lang=language,
            )
            analysis_text = translated.translated_text if translated else text
        except Exception:  # noqa: BLE001
            analysis_text = text
    else:
        analysis_text = text

    words_lower = _tokenize_words(analysis_text)
    word_set = set(words_lower)

    scores: dict[str, float] = {}
    top_words: dict[str, list[str]] = {}
    for emo, bag in _EMOTION_LEXICON.items():
        hits = sorted(word_set & bag["words"])
        # Weight by VADER polarity
        scores[emo] = len(hits)
        top_words[emo] = hits[:8]

    # Use VADER to tilt joy vs sadness vs anger
    analyzer = _get_vader()
    vs = analyzer.polarity_scores(analysis_text)
    compound = vs["compound"]
    if compound >= 0.25:
        scores["joy"] = scores.get("joy", 0) + 1.0 + (compound * 2.0)
    elif compound <= -0.25:
        neg_bias = -compound * 2.0
        if scores["anger"] > 0:
            scores["anger"] += neg_bias
        else:
            scores["sadness"] = scores.get("sadness", 0) + 0.7 * neg_bias
            scores["fear"] = scores.get("fear", 0) + 0.3 * neg_bias

    # Fallback — if no emotion had any lexicon hit, infer from VADER compound.
    if sum(v for k, v in scores.items() if k != "neutral") == 0:
        if compound > 0.1:
            scores["joy"] = max(scores.get("joy", 0), 0.7)
            top_words["joy"] = ["positive tone"]
        elif compound < -0.1:
            scores["sadness"] = max(scores.get("sadness", 0), 0.5)
            scores["anger"] = max(scores.get("anger", 0), 0.3)
            top_words["sadness"] = ["negative tone"]
        else:
            scores["neutral"] = 1.0

    scores["neutral"] = max(0.0, 1.0 - sum(v for k, v in scores.items() if k != "neutral") * 0.4)

    # Normalize scores so they sum to 1.0
    total = sum(scores.values()) or 1.0
    normalized = {k: round(v / total, 3) for k, v in scores.items()}

    primary = max(normalized, key=normalized.get)  # type: ignore[arg-type]
    return EmotionResponse(primary=primary, scores=normalized, topWords=top_words)


# ---------------------------------------------------------------------------
# List supported languages
# ---------------------------------------------------------------------------
class SupportedLanguage(BaseModel):
    code: Language
    label: str
    indicTrans2Supported: bool


@router.get("/languages", response_model=list[SupportedLanguage])
def list_languages():
    result: list[SupportedLanguage] = []
    for code in SUPPORTED_LANGUAGES:
        result.append(
            SupportedLanguage(
                code=code,
                label=LANGUAGE_LABELS[code],
                indicTrans2Supported=code != "en" or True,
            )
        )
    return result
