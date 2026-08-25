"""Database clients (MongoDB / Neo4j / ChromaDB) — lazy singletons."""

from __future__ import annotations

from functools import lru_cache
from typing import TYPE_CHECKING, Any

from core.config import get_settings

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

settings = get_settings()


# ---------------------------------------------------------------------------
# MongoDB (Async)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_mongo_client() -> "AsyncIOMotorClient":
    from motor.motor_asyncio import AsyncIOMotorClient

    return AsyncIOMotorClient(settings.mongo_uri)


def get_mongo_db() -> "AsyncIOMotorDatabase":
    return get_mongo_client()[settings.mongo_db]


# ---------------------------------------------------------------------------
# Neo4j (sync Bolt driver — simplest for KG ops)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_neo4j_driver() -> Any:
    from neo4j import GraphDatabase

    return GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )


# ---------------------------------------------------------------------------
# ChromaDB vector store
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_chroma_client() -> Any:
    import chromadb

    return chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)


def get_collection() -> Any:
    return get_chroma_client().get_or_create_collection(settings.chroma_collection)
