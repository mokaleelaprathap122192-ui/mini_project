-- =====================================================================
--  Neo4j Knowledge Graph — initial constraints + seed ontology
--  Run in Neo4j Browser or via cypher-shell once the DB is up.
-- =====================================================================

-- Nodes
CREATE CONSTRAINT entity_name_unique IF NOT EXISTS
  FOR (n:Entity) REQUIRE n.name IS UNIQUE;

CREATE CONSTRAINT source_url_unique IF NOT EXISTS
  FOR (s:Source) REQUIRE s.url IS UNIQUE;

CREATE INDEX claim_id_idx IF NOT EXISTS
  FOR (c:Claim) ON (c.externalId);

-- Seeded taxonomy of the Claim/Support/Refute relationships
CREATE (x:Tag { name:'LINGUISTIC_BIAS' }),(y:Tag { name:'FACT_CHECK' });

-- Quick example path:
--   CREATE (c:Claim { id:'demo_01', text:'Bengaluru hottest summer 2024' })
--     -[:SUPPORTS { confidence:0.89 }]->
--          (s:Source { url:'https://mausam.imd.gov.in', title:'IMD 2024 Summary' })
