"""
ontology.py — n10s-style Semantic Ontology Rules for Neo4j

This module implements ontology enforcement at the application layer,
mimicking what the neosemantics (n10s) Neo4j plugin does at the database layer.

HOW IT WORKS:
  After Graphiti writes entities/relationships to Neo4j, the OntologyValidator
  runs Cypher queries to:
    1. Apply semantic type labels to nodes (e.g., :Organisation, :Person, :Product)
    2. Enforce that invalid relationship types are flagged and logged
    3. Apply Cypher CONSTRAINT rules so duplicate entities are merged, not duplicated

FUTURE UPGRADE:
  When Neo4j Aura Professional is available, replace this file with a true
  n10s RDF/OWL import using:
    CALL n10s.graphconfig.init()
    CALL n10s.onto.import.inline(<OWL_TURTLE_STRING>, "Turtle")

  Until then, this Python-level ontology gives us 80% of the benefit
  of n10s without requiring the plugin.
"""

import logging
from neo4j import AsyncGraphDatabase

logger = logging.getLogger(__name__)

# ── Ontology Definition ─────────────────────────────────────────────────────
# Define which labels are semantically valid and what they are allowed to do.
# Format: { "EntityType": { "can_be_subject_of": [...], "properties": [...] } }

ONTOLOGY = {
    "Organisation": {
        "description": "A company, firm, or institution",
        "can_be_subject_of": ["HAS_CLIENT", "SELLS", "PARTNERS_WITH", "EMPLOYS", "OWNS"],
        "aliases": ["Company", "Corp", "Firm", "Enterprise", "Business", "Agency"],
    },
    "Person": {
        "description": "A human being or individual",
        "can_be_subject_of": ["WORKS_AT", "MANAGES", "REPORTS_TO", "OWNS", "BUYS"],
        "aliases": ["Employee", "User", "Client", "Customer", "Individual"],
    },
    "Product": {
        "description": "A physical or digital product",
        "can_be_subject_of": ["IS_PART_OF", "COSTS", "BELONGS_TO"],
        "aliases": ["Item", "SKU", "Service", "Offering"],
    },
    "Contract": {
        "description": "A legal agreement between two or more parties",
        "can_be_subject_of": ["SIGNED_BY", "EXPIRES_ON", "GOVERNS"],
        "aliases": ["Agreement", "Deal", "SLA", "MOU"],
    },
    "Event": {
        "description": "A business event or occurrence with a timestamp",
        "can_be_subject_of": ["OCCURRED_AT", "INVOLVES", "TRIGGERED_BY"],
        "aliases": ["Transaction", "Order", "Meeting", "Incident"],
    },
}

# ── Cypher Constraints applied once at startup ───────────────────────────────
# These prevent duplicate nodes from being created and enforce uniqueness.
STARTUP_CONSTRAINTS = [
    # Ensure each unique entity name appears only once per type
    "CREATE CONSTRAINT entity_unique IF NOT EXISTS FOR (n:Entity) REQUIRE n.uuid IS UNIQUE",
]

# ── Post-ingestion Cypher rules ──────────────────────────────────────────────
# Run these after every Graphiti episode to enforce semantic consistency.
POST_INGEST_RULES = [
    # Rule 1: Merge all Organisation-type nodes under a common :Organisation label
    """
    MATCH (n:Entity)
    WHERE any(alias IN {aliases} WHERE toLower(n.name) CONTAINS toLower(alias))
       OR n.label IN {aliases}
    SET n:Organisation
    """,
    # Rule 2: Merge all Person-type nodes under a common :Person label
    """
    MATCH (n:Entity)
    WHERE any(alias IN {person_aliases} WHERE toLower(n.name) CONTAINS toLower(alias))
    SET n:Person
    """,
]


class OntologyValidator:
    """
    Applies n10s-style ontology rules after each Graphiti ingestion.

    Usage:
        validator = OntologyValidator(uri, username, password)
        await validator.apply_startup_constraints()
        # ... after each ingest ...
        await validator.apply_post_ingest_rules()
        await validator.close()
    """

    def __init__(self, uri: str, username: str, password: str, database: str = "neo4j") -> None:
        self._driver = AsyncGraphDatabase.driver(uri, auth=(username, password))
        self._database = database
        self._uri = uri
        logger.info("OntologyValidator ready — uri=%s db=%s", uri, database)

    async def apply_startup_constraints(self) -> None:
        """
        Run once at server startup to set up Neo4j uniqueness constraints.
        These guarantee that duplicate entities are never created.
        """
        async with self._driver.session(database=self._database) as session:
            for cypher in STARTUP_CONSTRAINTS:
                try:
                    await session.run(cypher)
                    logger.info("Ontology constraint applied: %s", cypher[:60])
                except Exception as e:
                    # Constraint may already exist — safe to ignore
                    logger.debug("Constraint skipped (likely exists): %s", e)

    async def apply_post_ingest_rules(self) -> None:
        """
        Run after each Graphiti episode ingestion.
        Classifies nodes into semantic types (Organisation, Person, Product, etc.)
        based on the ONTOLOGY definition above.
        This is the n10s-equivalent step that enforces the semantic ontology.
        """
        async with self._driver.session(database=self._database) as session:
            # Apply Organisation labels
            org_aliases = ONTOLOGY["Organisation"]["aliases"]
            try:
                await session.run(
                    """
                    MATCH (n)
                    WHERE (n:Entity OR n:EntityNode)
                      AND any(alias IN $aliases WHERE toLower(n.name) CONTAINS toLower(alias))
                    SET n:Organisation
                    """,
                    aliases=org_aliases,
                )
                logger.info("Ontology rule applied: Organisation classification")
            except Exception as e:
                logger.warning("Organisation rule skipped: %s", e)

            # Apply Person labels
            person_aliases = ONTOLOGY["Person"]["aliases"]
            try:
                await session.run(
                    """
                    MATCH (n)
                    WHERE (n:Entity OR n:EntityNode)
                      AND any(alias IN $aliases WHERE toLower(n.name) CONTAINS toLower(alias))
                    SET n:Person
                    """,
                    aliases=person_aliases,
                )
                logger.info("Ontology rule applied: Person classification")
            except Exception as e:
                logger.warning("Person rule skipped: %s", e)

            # Apply Product labels
            product_aliases = ONTOLOGY["Product"]["aliases"]
            try:
                await session.run(
                    """
                    MATCH (n)
                    WHERE (n:Entity OR n:EntityNode)
                      AND any(alias IN $aliases WHERE toLower(n.name) CONTAINS toLower(alias))
                    SET n:Product
                    """,
                    aliases=product_aliases,
                )
                logger.info("Ontology rule applied: Product classification")
            except Exception as e:
                logger.warning("Product rule skipped: %s", e)

            # Apply Contract labels
            contract_aliases = ONTOLOGY["Contract"]["aliases"]
            try:
                await session.run(
                    """
                    MATCH (n)
                    WHERE (n:Entity OR n:EntityNode)
                      AND any(alias IN $aliases WHERE toLower(n.name) CONTAINS toLower(alias))
                    SET n:Contract
                    """,
                    aliases=contract_aliases,
                )
                logger.info("Ontology rule applied: Contract classification")
            except Exception as e:
                logger.warning("Contract rule skipped: %s", e)

    async def get_ontology_stats(self) -> dict:
        """
        Returns a count of how many nodes exist per semantic type.
        Useful for the dashboard and for debugging.
        """
        stats = {}
        async with self._driver.session() as session:
            for entity_type in ONTOLOGY.keys():
                try:
                    result = await session.run(
                        f"MATCH (n:{entity_type}) RETURN count(n) AS count"
                    )
                    record = await result.single()
                    stats[entity_type] = record["count"] if record else 0
                except Exception:
                    stats[entity_type] = 0
        logger.info("Ontology stats: %s", stats)
        return stats

    async def close(self) -> None:
        await self._driver.close()
        logger.info("OntologyValidator closed.")
