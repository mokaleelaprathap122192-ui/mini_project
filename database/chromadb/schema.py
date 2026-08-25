"""
ChromaDB vector store — collection definition + embedding schema.

GraphRAG retrieval pipeline:
  1. Chunk uploaded documents (langchain RecursiveTextSplitter, ~1024 tokens).
  2. Embed with MuRIL / sentence-transformers `all-mpnet-base-v2`.
  3. Insert into Chroma collection `document_embeddings`.
  4. Attach metadata: source document_id, language, section, entities (NER).
"""

from __future__ import annotations

import chromadb
from chromadb.config import Settings


EMBEDDING_DIM = 768          # MuRIL / all-mpnet-base-v2 dim
COLLECTION_NAME = "document_embeddings"
METADATA_SCHEMA = {
    "document_id": "str",        # FK to Mongo uploads._id
    "language":    "str",        # 2-letter code (en, hi, ta, te, gu, kn, ml, mr, bn, sa)
    "chunk_index": "int",
    "section":     "str|None",
    "entities":    "list[str]",  # JSON list of KG Entity names
    "source_type": "str",        # pdf, docx, txt, news_url, youtube, ...
}


def init_collection(client: chromadb.ClientAPI) -> chromadb.Collection:
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine", "embedding_dim": EMBEDDING_DIM},
    )


if __name__ == "__main__":
    client = chromadb.HttpClient(
        host="localhost",
        port=8000,
        settings=Settings(anonymized_telemetry=False),
    )
    col = init_collection(client)
    print(f"Initialized collection: {col.name}  count={col.count()}")
