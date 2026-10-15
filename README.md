# High Accuracy Fast AI Agents

> **A deterministic, hallucination-free B2B RAG system built on Knowledge Graphs — not just vector similarity.**

Full system documentation: [Architecture & Design Document](https://docs.google.com/document/d/1CLrvQRWzJqZcOdEudTX-Tkn9L5b1XHEDP_m1LU-jI3A/edit?usp=sharing)

---

## Why This Exists

Most enterprise AI chatbots are built on basic Retrieval-Augmented Generation (RAG). They chunk documents, stuff them into a vector database, and ask a large LLM to guess an answer. The result is:

- **Hallucinations** — the LLM fabricates details not in the data
- **High cost** — entire document pages are sent as LLM tokens
- **Slow inference** — large prompts take longer to process
- **No audit trail** — impossible to know *when* a fact was true

This system solves all four problems by replacing the vector-only approach with a **Bitemporal Knowledge Graph** (Neo4j + Graphiti). The LLM is used *only* for language formatting, not for "thinking up" answers.

---

## The 4 Core Differentiators

### 1. Separation of Concerns — Decoupled I/O
Ingestion and querying are completely separated. The Streamlit UI (query layer) and the Flask API (ingestion engine) run as two independent services on AWS Elastic Beanstalk. Ingestion jobs are processed asynchronously in the background — just like a WhatsApp message queue — so a large PDF upload never freezes the chat interface for other users.

### 2. Higher Accuracy — Graph Semantic Ontology, Not Just Similarity
Instead of using vector similarity to guess which document chunk might be relevant, the system builds an actual graph of **Entities** (e.g., Acme Corp) and **Relationships** (e.g., IS_A → Premium Client). When a user asks a question, the system traverses guaranteed, validated graph edges. The answer is deterministic — it comes from the graph, not from the LLM's imagination.

### 3. Fewer Tokens — LLM Only for Language Support
In standard RAG, 2–5 pages of raw text are sent to the LLM per query. This system sends only 2–3 bullet points extracted from the graph. The LLM's sole job is to format those graph facts into a readable sentence. This drastically reduces token usage, cloud inference costs, and response latency.

### 4. Bitemporal Stamping — Two Timestamps Per Fact
Every fact written to Neo4j carries two timestamps:
- **Event time** — when the event actually occurred in the real world
- **Ingestion time** — when the data was added to our system

This creates an immutable, append-only audit log. Old states are never deleted; they are superseded by newer states. Enterprises get a perfect historical record — critical for compliance, finance, and healthcare.

---

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Query UI | Streamlit (Python) | Chat interface, file upload, knowledge store viewer |
| Backend API | Flask + Gunicorn | REST API for ingestion and retrieval |
| Knowledge Graph Engine | Graphiti-core 0.30.2 | Extracts entities, writes graph episodes to Neo4j |
| Graph Database | Neo4j Aura (Cloud) | Stores nodes, edges, and dense vector embeddings |
| Embeddings | Google Gemini gemini-embedding-001 | Converts text to 1536-dim dense vectors |
| LLM (Entity Extraction) | Google Gemini gemini-2.0-flash | Extracts graph entities during ingestion |
| LLM (Answer Formatting) | Groq openai/gpt-oss-120b | Formats graph facts into readable sentences |
| Reranker | Gemini Reranker | Reranks search results for maximum precision |
| File Ingestion | PyPDF2, Python csv | Parses PDFs and CSVs into graph episodes |
| Hosting | AWS Elastic Beanstalk | Two separate environments (UI + API) |
| Async Runtime | Python asyncio + nest-asyncio | Non-blocking graph operations on Flask |
| Future — Ontology | neosemantics (n10s) for Neo4j | OWL/RDF-based semantic rules on the graph (next sprint) |

---

## Hosting & Wiring Guide

This system runs as **two completely separate services** on AWS Elastic Beanstalk.

```
                         USER
                           |
                    +------+------+
                    |  Streamlit  |  <-- context-platform EB Environment
                    |  (Port 80)  |      (Frontend / Query UI)
                    +------+------+
                           |
                     HTTP POST /api/chat
                     HTTP POST /api/ingest-file
                           |
                    +------+------+
                    |    Flask    |  <-- neo4j-graphiti-bot EB Environment
                    |  (Port 80)  |      (Backend / AI Engine)
                    +------+------+
                           |
              +------------+------------+
              |            |            |
       +------+--+  +------+--+  +------+---+
       |  Neo4j  |  | Gemini  |  |   Groq   |
       |  Aura   |  |  (Free) |  |  (Fast)  |
       +---------+  +---------+  +----------+
```

### Service 1 — Backend AI Engine (this repo)
| Property | Value |
|----------|-------|
| GitHub Repo | https://github.com/aparneshgaurav/highAccuracyFastAiAgents.git |
| AWS Application | neo4j-graphiti-bot |
| AWS Environment | Neo4j-graphiti-bot-env |
| Region | us-east-1 |
| Platform | Python 3.14 on Amazon Linux 2023 |
| Entry Point | application:application (Gunicorn) |
| Key File | Procfile: `web: gunicorn application:application --workers 1 --timeout 120` |

### Service 2 — Frontend Query UI (context-platform)
| Property | Value |
|----------|-------|
| GitHub Repo | https://github.com/shivanshinigam/context-platform.git |
| AWS Application | context-platform |
| AWS Environment | context-platform-env |
| Region | us-east-1 |
| Platform | Python 3.14 on Amazon Linux 2023 |
| Entry Point | Streamlit via supervisor (start_services.sh) |

### Environment Variables (set in AWS EB Console → Configuration → Software)

| Variable | Description |
|----------|-------------|
| NEO4J_URI | neo4j+s://374c3f2c.databases.neo4j.io |
| NEO4J_USERNAME | neo4j |
| NEO4J_PASSWORD | Your Neo4j Aura password |
| GEMINI_API_KEY | From https://aistudio.google.com/apikey |
| GROQ_API_KEY | From https://console.groq.com |
| FLASK_SECRET_KEY | Any random string |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check — returns {"status": "ok"} |
| POST | /api/chat | Send a message — auto-detects ingest vs. query intent |
| POST | /api/ingest | Directly ingest a text episode |
| POST | /api/query | Directly query the knowledge graph |
| POST | /api/ingest-file | Upload and ingest a CSV or PDF file |

---

## Code Workflow

### Ingestion Flow
```
User uploads file / types "Remember that..."
  -> Streamlit sends POST /api/ingest-file or /api/chat
  -> Flask (application.py) receives request
  -> PyPDF2 / csv parses file into text episodes
  -> run_fresh() creates a fresh async event loop
  -> GraphitiService.ingest() is called
      -> Graphiti calls Gemini to extract Entities & Relationships
      -> Graphiti calls Gemini Embedder -> converts text to dense vectors
      -> Graphiti writes Node, Edge, and DenseVector to Neo4j Aura
  -> Flask returns success response to Streamlit
```

### Retrieval Flow
```
User types a question
  -> Streamlit sends POST /api/chat
  -> Flask detects no ingest intent -> calls GraphitiService.search()
  -> Graphiti calls Gemini Embedder -> converts question to vector
  -> Graphiti searches Neo4j using vector similarity + graph traversal
  -> Gemini Reranker reranks results by relevance
  -> Top facts returned to Flask
  -> Flask sends facts to Groq with strict prompt: "Format only, do not guess"
  -> Groq returns a clean sentence
  -> Flask sends reply to Streamlit -> User sees the answer
```

---

## File Structure

```
neo4j-graphiti-bot/
├── application.py              # Flask app — all API routes
├── graphiti_service.py         # Graphiti wrapper — ingest + search logic
├── requirements.txt            # Python dependencies
├── Procfile                    # Gunicorn startup command for Elastic Beanstalk
├── .ebextensions/
│   └── 01_environment.config  # AWS environment variable config
├── static/
│   ├── css/style.css           # Chat UI styles
│   └── js/chat.js              # Chat UI JavaScript
└── templates/
    └── index.html              # Chat UI HTML template
```

---

## Deployment Steps

### Deploy the Backend (this repo)
1. Zip the folder:
   `zip -r application.zip . -x "*.git*" -x "*venv*" -x "*__pycache__*" -x "*.env"`
2. Go to AWS Elastic Beanstalk → Neo4j-graphiti-bot-env
3. Click Upload and Deploy → upload application.zip
4. Wait for deployment to go green

### Deploy the Frontend (context-platform)
1. Zip the context-platform folder:
   `zip -r context.zip . -x "*.git*" -x "*venv*" -x "*__pycache__*" -x "*.DS_Store"`
2. Go to AWS Elastic Beanstalk → context-platform-env
3. Click Upload and Deploy → upload context.zip

---

## Roadmap — What Is Being Built Next

### n10s (neosemantics) Integration
Currently, Graphiti extracts entities and relationships automatically from free text. The next sprint will layer **neosemantics (n10s)** rules on top of the Neo4j graph. This enforces an industry-specific ontology at write time — so if someone tries to save data that violates the semantic rules, the graph will reject it before it is ever stored. This moves the system from probabilistic to fully deterministic.

### Sector-Specific Small Language Models (SLMs) on HuggingFace

**What this means in simple terms:**

The same word means different things in different industries. For example, "CAR" in Finance means Capital Adequacy Ratio. "CAR" in Automotive means the physical vehicle. A general-purpose LLM makes mistakes on these kinds of industry-specific abbreviations.

The plan is to train small, focused language models (SLMs) — one per industry sector (Finance, Healthcare, Retail, Logistics) — and host them privately on HuggingFace. Each model will have a deep, sector-specific vocabulary. Enterprise clients in Finance will use the Finance SLM. Healthcare clients will use the Healthcare SLM. This makes entity extraction during ingestion far more accurate because the model already "speaks the language" of that industry.

These are hosted in a secured, private way on HuggingFace so client data never goes to a public model.

### Per-Sector Neo4j Instances

**What this means in simple terms:**

Right now, every client shares one Neo4j graph database. In production, each industry sector will have its own dedicated Neo4j instance that is pre-loaded with the correct domain ontology for that sector.

For example, the Finance Neo4j instance will already "know" what a Bond, Portfolio, and Issuer are before a single document is uploaded. The Healthcare instance will already understand what a Diagnosis, Patient, and Drug interaction means.

This means that when a new Finance client joins, their data immediately gets the right structure and relationships without any manual configuration. Retrieval accuracy is much higher from day one because the graph already speaks the language of that sector.

---

## References

- [Full Architecture & Design Document (Google Doc)](https://docs.google.com/document/d/1CLrvQRWzJqZcOdEudTX-Tkn9L5b1XHEDP_m1LU-jI3A/edit?usp=sharing)
- [Graphiti by Zep — Knowledge Graph for AI Agents](https://github.com/getzep/graphiti)
- [Neo4j Aura Free Cloud Instance](https://neo4j.com/cloud/platform/aura-graph-database/)
- [neosemantics (n10s) — OWL/RDF on Neo4j](https://neo4j.com/labs/neosemantics/)
- [Google AI Studio — Free Gemini API](https://aistudio.google.com/apikey)
- [Groq — Fastest LLM Inference](https://console.groq.com)
