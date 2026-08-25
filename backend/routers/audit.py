"""Audit router — CLFI score, fairness metric tables, alerts, recommendations."""

from __future__ import annotations

import random
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from models.common import Language, LANGUAGE_LABELS

router = APIRouter(prefix="/audit")

RiskLevel = Literal["low", "medium", "high"]


class FairnessMetric(BaseModel):
    language: Language
    accuracy: float
    precision: float
    recall: float
    f1: float
    parity: float


class Alert(BaseModel):
    severity: RiskLevel
    message: str


class RadarAxis(BaseModel):
    axis: str
    value: float


class RadarDataset(BaseModel):
    language: Language
    axes: list[RadarAxis]


class FairnessAuditResponse(BaseModel):
    metrics: list[FairnessMetric]
    clfiScore: int
    radarDatasets: list[RadarDataset]
    alerts: list[Alert]
    recommendations: list[str]


@router.post("/fairness", response_model=FairnessAuditResponse)
def run_audit(_payload: dict | None = None):
    metrics: list[FairnessMetric] = []
    for lang in LANGUAGE_LABELS.keys():
        base = 0.7 + random.random() * 0.25
        metrics.append(
            FairnessMetric(
                language=lang,
                accuracy=round(base, 3),
                precision=round(base - 0.02 + random.random() * 0.04, 3),
                recall=round(base - 0.03 + random.random() * 0.05, 3),
                f1=round(base - 0.01 + random.random() * 0.03, 3),
                parity=round(0.6 + random.random() * 0.35, 3),
            ),
        )
    avg_acc = sum(m.accuracy for m in metrics) / len(metrics)
    avg_par = sum(m.parity for m in metrics) / len(metrics)
    radar_datasets = [
        RadarDataset(
            language=m.language,
            axes=[
                RadarAxis(axis='Accuracy', value=m.accuracy),
                RadarAxis(axis='Precision', value=m.precision),
                RadarAxis(axis='Recall', value=m.recall),
                RadarAxis(axis='F1', value=m.f1),
                RadarAxis(axis='Parity', value=m.parity),
            ],
        )
        for m in metrics[:5]
    ]
    return FairnessAuditResponse(
        metrics=metrics,
        clfiScore=round(avg_acc * 60 + avg_par * 40),
        radarDatasets=radar_datasets,
        alerts=[
            Alert(
                severity="high",
                message="Statistically significant disparity detected for Gujarati Recall (p<0.05).",
            ),
            Alert(severity="medium", message="Kannada F1 score deviates >5% from the language mean."),
            Alert(severity="low", message="Sanskrit sample size below recommended threshold."),
        ],
        recommendations=[
            "Upsample low-resource training data with back-translations.",
            "Apply adversarial debiasing on IndicBERT embeddings across 67%).",
            "Tune decision thresholds per-language to equalize true positive rates.",
        ],
    )
