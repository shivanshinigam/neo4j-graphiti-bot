"""
graphiti_service.py - Async wrapper around graphiti-core 0.30.x
Using Google Gemini (FREE) instead of OpenAI.

Free Gemini tier via Google AI Studio:
  - LLM  : gemini-2.0-flash  (15 RPM, 1M TPM free)
  - Embed: text-embedding-004 (free)
  Get your free key at: https://aistudio.google.com/apikey
"""

import logging
from datetime import datetime, timezone
from typing import Any

from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType
from graphiti_core.llm_client.config import LLMConfig
from graphiti_core.llm_client.gemini_client import GeminiClient
from graphiti_core.llm_client.groq_client import GroqClient
from graphiti_core.embedder.gemini import GeminiEmbedder, GeminiEmbedderConfig
from graphiti_core.cross_encoder.gemini_reranker_client import GeminiRerankerClient

logger = logging.getLogger(__name__)


class GraphitiService:
    """
    Async wrapper around Graphiti using FREE Google Gemini models.

    LLM     : gemini-2.0-flash        (free via Google AI Studio)
    Embedder: text-embedding-004       (free via Google AI Studio)
    Database: Neo4j Aura Free          (free cloud instance)
    """

    def __init__(
        self,
        uri: str,
        username: str,
        password: str,
        gemini_api_key: str,
        groq_api_key: str,
    ) -> None:
        # ── LLM: Groq (using openai/gpt-oss-120b) ────────
        llm_config = LLMConfig(
            api_key=groq_api_key,
            model="openai/gpt-oss-120b",
        )
        llm_client = GroqClient(config=llm_config)

        # ── Embedder: gemini-embedding-001 (free, available on this key) ────────
        embedder_config = GeminiEmbedderConfig(
            api_key=gemini_api_key,
            embedding_model="gemini-embedding-001",
            embedding_dim=1536,
        )
        embedder = GeminiEmbedder(config=embedder_config)

        # ── Cross-encoder (reranker): Gemini ─────────────────────────────────
        cross_encoder = GeminiRerankerClient(config=llm_config)

        # ── Graphiti client ───────────────────────────────────────────────────
        self._client = Graphiti(
            uri=uri,
            user=username,
            password=password,
            llm_client=llm_client,
            embedder=embedder,
            cross_encoder=cross_encoder,
        )
        self._initialised = False
        logger.info("GraphitiService (Gemini) created — uri=%s", uri)

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def initialise(self) -> None:
        """Build Neo4j vector indices and constraints. Idempotent."""
        if self._initialised:
            return
        await self._client.build_indices_and_constraints()
        self._initialised = True
        logger.info("Neo4j indices and constraints ready.")

    async def close(self) -> None:
        await self._client.close()
        logger.info("GraphitiService closed.")

    # ── Ingestion ─────────────────────────────────────────────────────────────

    async def ingest(self, name: str, content: str) -> None:
        """
        Parse content with Gemini LLM, extract knowledge graph nodes/edges,
        embed them with text-embedding-004, and write to Neo4j Aura.
        """
        logger.info("Ingesting episode '%s' (%d chars).", name, len(content))
        await self._client.add_episode(
            name=name,
            episode_body=content,
            source=EpisodeType.text,
            source_description="User-provided fact via chatbot",
            reference_time=datetime.now(timezone.utc),
        )
        logger.info("Episode '%s' ingested successfully.", name)

    # ── Retrieval ─────────────────────────────────────────────────────────────

    async def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """
        Hybrid (vector + graph) search over the knowledge graph.
        Returns list of dicts with 'fact' and 'score' keys.
        """
        logger.info("Searching: '%s'", query)
        edges = await self._client.search(query, num_results=limit)

        results: list[dict[str, Any]] = []
        for edge in edges:
            fact  = getattr(edge, "fact", None) or str(edge)
            score = getattr(edge, "score", None)
            results.append({"fact": fact, "score": score})

        logger.info("Search returned %d results.", len(results))
        return results
