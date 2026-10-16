"""
graphiti_service.py - Async wrapper around graphiti-core 0.30.x
Using Google Gemini (FREE) instead of OpenAI.

n10s (neosemantics) ontology enforcement is applied after every episode
via OntologyValidator in ontology.py. This classifies all Neo4j nodes
into semantic types (Organisation, Person, Product, Contract) after Graphiti
writes them — making the graph deterministic and hallucination-resistant.

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

from ontology import OntologyValidator

logger = logging.getLogger(__name__)


class GraphitiService:
    """
    Async wrapper around Graphiti using FREE Google Gemini models,
    with n10s-style ontology enforcement after every write.

    LLM     : gemini-2.0-flash        (free via Google AI Studio)
    Embedder: gemini-embedding-001     (free via Google AI Studio)
    Database: Neo4j Aura Free          (free cloud instance)
    Ontology: OntologyValidator (n10s-style rules from ontology.py)
    """

    def __init__(
        self,
        uri: str,
        username: str,
        password: str,
        gemini_api_key: str,
        groq_api_key: str,
        database: str = "neo4j",
    ) -> None:
        # LLM: Groq (openai/gpt-oss-120b via Groq inference)
        llm_config = LLMConfig(
            api_key=groq_api_key,
            model="openai/gpt-oss-120b",
        )
        llm_client = GroqClient(config=llm_config)

        # Embedder: Gemini embedding-001 (free tier)
        embedder_config = GeminiEmbedderConfig(
            api_key=gemini_api_key,
            embedding_model="gemini-embedding-001",
            embedding_dim=1536,
        )
        embedder = GeminiEmbedder(config=embedder_config)

        # Cross-encoder reranker: Gemini
        cross_encoder = GeminiRerankerClient(config=llm_config)

        # Neo4j driver with correct Aura database name (instance ID, not 'neo4j')
        from graphiti_core.driver.neo4j_driver import Neo4jDriver
        neo4j_driver = Neo4jDriver(uri=uri, user=username, password=password, database=database)

        # Graphiti core client — pass pre-configured driver via graph_driver=
        self._client = Graphiti(
            graph_driver=neo4j_driver,
            llm_client=llm_client,
            embedder=embedder,
            cross_encoder=cross_encoder,
        )

        # n10s-style Ontology Validator
        # Runs Cypher rules after every ingest to classify nodes semantically
        self._ontology = OntologyValidator(uri=uri, username=username, password=password, database=database)

        self._initialised = False
        logger.info("GraphitiService (Gemini + n10s Ontology) created — uri=%s", uri)

    # Lifecycle

    async def initialise(self) -> None:
        """Build Neo4j vector indices, uniqueness constraints, and ontology startup rules."""
        if self._initialised:
            return
        await self._client.build_indices_and_constraints()
        await self._ontology.apply_startup_constraints()
        self._initialised = True
        logger.info("Neo4j indices, constraints, and ontology rules ready.")

    async def close(self) -> None:
        await self._client.close()
        await self._ontology.close()
        logger.info("GraphitiService closed.")

    # Ingestion

    async def ingest(self, name: str, content: str) -> None:
        """
        Ingest a text episode into the knowledge graph.

        Steps:
          1. Graphiti calls Gemini to extract Entities and Relationships from text
          2. Graphiti calls Gemini Embedder to convert text to 1536-dim dense vector
          3. Graphiti writes Node, Edge, and DenseVector to Neo4j Aura
          4. OntologyValidator (n10s) runs Cypher to classify new nodes into
             semantic types: Organisation, Person, Product, Contract, Event
        """
        logger.info("Ingesting episode '%s' (%d chars).", name, len(content))
        await self._client.add_episode(
            name=name,
            episode_body=content,
            source=EpisodeType.text,
            source_description="User-provided fact via chatbot",
            reference_time=datetime.now(timezone.utc),
        )
        logger.info("Episode '%s' ingested — running n10s ontology rules.", name)

        # n10s post-ingestion ontology enforcement
        # Non-blocking: a rule failure never cancels the successful ingestion
        try:
            await self._ontology.apply_post_ingest_rules()
            logger.info("n10s ontology rules applied after episode '%s'.", name)
        except Exception as ont_err:
            logger.warning("n10s ontology enforcement skipped: %s", ont_err)

    # Retrieval

    async def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """
        Hybrid (vector + graph traversal) search over the knowledge graph.
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

    async def get_ontology_stats(self) -> dict:
        """
        Returns count of semantically classified nodes per type.
        Useful for the dashboard to show graph health.
        """
        return await self._ontology.get_ontology_stats()
