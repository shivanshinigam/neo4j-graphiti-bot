# High Accuracy Fast AI Agents

> A deterministic, hallucination-free B2B Knowledge Graph AI system.  
> The LLM is used only for language. The answers come from the graph.

---

## Quick Navigation

| What you need | Where to go |
|---|---|
| How the system works end-to-end | [System Architecture](#system-architecture) |
| File call flow (which file calls which) | [Code Call Flow](#code-call-flow) |
| Ingestion step-by-step | [Ingestion Workflow](#ingestion-workflow) |
| Retrieval step-by-step | [Retrieval Workflow](#retrieval-workflow) |
| Full tech stack | [Tech Stack](#tech-stack) |
| AWS hosting, links, wiring | [Hosting & Deployment](#hosting--deployment) |
| Frontend (Streamlit UI) | [`streamlit-ui/`](./streamlit-ui/README.md) |
| n10s Ontology rules | [`ontology.py`](./ontology.py) |
| Full architecture doc (Google Doc) | [Architecture Document](https://docs.google.com/document/d/1CLrvQRWzJqZcOdEudTX-Tkn9L5b1XHEDP_m1LU-jI3A/edit?usp=sharing) |
| Roadmap | [Roadmap](#roadmap) |

---

## What This Is

Most AI chatbots are built on basic RAG — they stuff documents into a vector DB and ask the LLM to guess an answer.

This system is fundamentally different:

- **The graph stores the facts.** Graphiti + Neo4j extract and store Entities, Relationships, and dense Vectors from every document.
- **The LLM never guesses.** When a question comes in, the answer is pulled directly from the graph. The LLM only formats the language.
- **Every fact is timestamped twice.** When it happened, and when it was ingested — creating a full audit log. Nothing is deleted; states are superseded.
- **Ontology enforced.** After every write, `ontology.py` runs Cypher rules to classify nodes into semantic types (Organisation, Person, Product, Contract). The graph is always semantically consistent.

---

## System Architecture

```
                            USER
                             |
                     +-------+-------+
                     |   Streamlit   |   <-- streamlit-ui/  (Frontend)
                     |   Query UI    |       Hosted: AWS Elastic Beanstalk
                     +-------+-------+
                             |
                  HTTP POST /api/chat
                  HTTP POST /api/ingest-file
                             |
                     +-------+-------+
                     |     Flask     |   <-- application.py (Backend)
                     |   API Engine  |       Hosted: AWS Elastic Beanstalk
                     +-------+-------+
                             |
           +-----------------+-----------------+
           |                 |                 |
    +------+------+   +------+------+   +------+------+
    |   Neo4j     |   |   Gemini    |   |    Groq     |
    |   Aura      |   |  Embedder   |   |    LLM      |
    | (Graph DB)  |   | (Vectors)   |   | (Language)  |
    +-------------+   +-------------+   +-------------+
           |
    +------+------+
    |  ontology.py|
    |  n10s Rules |
    | (Semantic   |
    |  Classifier)|
    +-------------+
```

**Two separate AWS Elastic Beanstalk environments. Neither can see the other's internals.**
The Frontend only ever calls the Backend API. It never touches the database or API keys directly.

---

## Code Call Flow

```
AWS starts the app
  Procfile --> application.py (Flask server starts)

When a user sends a message:

  streamlit_app.py
    --> POST /api/chat --> application.py

  application.py
    --> graphiti_service.py (ingest or search)

  graphiti_service.py
    --> Gemini  (convert text to numbers / vectors)
    --> Neo4j   (save or search graph nodes and edges)
    --> ontology.py (classify new nodes into semantic types)

  application.py
    --> Groq (format the graph facts into a clean sentence)

  application.py
    --> streamlit_app.py --> User sees the reply

One line:
Procfile -> application.py -> graphiti_service.py -> Gemini + Neo4j + ontology.py -> Groq -> User
```

---

## Ingestion Workflow

When a user uploads a file or types "Remember that Acme Corp is a premium client":

```
Step 1 — streamlit_app.py
  User types / uploads
  --> POST /api/chat or /api/ingest-file --> application.py

Step 2 — application.py
  Detects "Remember that" / "Store" keyword
  --> This is an INGESTION request
  --> run_fresh() creates a fresh async event loop

Step 3 — graphiti_service.py --> svc.ingest()
  Graphiti does 3 things in sequence:

  1. Calls Groq LLM
     Reads the sentence
     Extracts: Entity = "Acme Corp", Property = "premium client"

  2. Calls Gemini Embedder
     Converts text into 1536 numbers (a dense vector)
     So it can be found later by similarity search

  3. Writes to Neo4j Aura
     Saves the Entity as a Node
     Saves the Relationship as an Edge
     Saves the 1536 numbers as a DenseVector on the node
     Stamps two timestamps: event_time + ingestion_time (bitemporal)

Step 4 — ontology.py --> OntologyValidator.apply_post_ingest_rules()
  Runs Cypher queries on Neo4j
  Classifies the new "Acme Corp" node as :Organisation
  Enforces semantic rules on the graph

Step 5 — Flask replies to Streamlit
  User sees: "Stored in the knowledge graph"
```

**One line:** User writes fact → Flask → Groq extracts entities → Gemini creates vectors → Neo4j saves graph → n10s classifies nodes

### When a CSV is uploaded from the frontend

The `/api/ingest-file` route converts every CSV row into a separate episode.
**n10s runs once per row** — so a 50-row CSV triggers 50 Graphiti writes and 50 n10s classification passes.

```
CSV uploaded (50 rows)
  --> application.py parses into 50 episodes
  --> FOR EACH ROW:
        Graphiti writes Node + Edge + Vector to Neo4j
        OntologyValidator.apply_post_ingest_rules()  <-- n10s runs HERE, every row
        Node gets classified: :Organisation / :Person / :Product / :Contract
```

> **Performance note:** For large CSVs (500+ rows), ingestion will be slow because each row
> is a separate round trip to Graphiti → Gemini → Neo4j → n10s. This is intentional and correct
> for B2B batch ingestion (e.g., overnight jobs). For real-time high-volume streaming,
> a Kafka queue will be added in the next sprint to handle this asynchronously.

---

## Retrieval Workflow

When a user asks "What type of client is Acme Corp?":

```
Step 1 — streamlit_app.py
  User types question
  --> POST /api/chat --> application.py

Step 2 — application.py
  No "Remember that" keyword found
  --> This is a QUERY request

Step 3 — graphiti_service.py --> svc.search()
  Graphiti does 3 things internally:

  1. Calls Gemini Embedder
     Converts the question into 1536 numbers

  2. Searches Neo4j
     Finds the closest matching vectors
     Traverses graph edges to find related facts

  3. Gemini Reranker
     Reranks results by relevance
     Returns top 5 matching facts

Step 4 — application.py --> _synthesize_answer()
  Sends only those 2-3 bullet facts to Groq
  Groq formats them into one readable sentence
  (Groq does NOT invent anything — it only formats what the graph returned)

Step 5 — Flask replies to Streamlit
  User sees a clean, accurate answer
```

**One line:** Question → Flask → Graphiti (Gemini encodes + Neo4j searches + reranks) → Groq formats → User sees reply

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend UI | Streamlit (Python) | Chat, file upload, client wizard |
| Backend API | Flask + Gunicorn | REST API — ingestion and retrieval |
| Knowledge Graph | Graphiti-core 0.30.2 | Extracts entities, writes episodes to Neo4j |
| Graph Database | Neo4j Aura (Cloud) | Stores nodes, edges, dense vectors |
| Embeddings | Gemini `gemini-embedding-001` | Converts text to 1536-dim vectors |
| Entity Extraction LLM | Gemini `gemini-2.0-flash` | Extracts graph entities during ingestion |
| Answer Formatting LLM | Groq `openai/gpt-oss-120b` | Formats graph facts into readable sentences |
| Reranker | Gemini Reranker | Reranks search results by relevance |
| Semantic Ontology | `ontology.py` (n10s-style) | Classifies nodes post-write: Organisation, Person, Product, Contract |
| File Parsing | PyPDF2, Python `csv` | Parses PDFs and CSVs into episodes |
| Async Runtime | Python asyncio + nest-asyncio | Non-blocking graph ops inside Flask |
| Hosting | AWS Elastic Beanstalk | Two separate environments (UI + API) |
| Future: Ontology Plugin | neosemantics (n10s) for Neo4j | Full OWL/RDF enforcement at DB level |

---

## Hosting & Deployment

### Two Services, Two Environments

| | Backend (this repo) | Frontend |
|---|---|---|
| **GitHub** | github.com/aparneshgaurav/highAccuracyFastAiAgents | github.com/shivanshinigam/context-platform |
| **AWS App** | neo4j-graphiti-bot | context-platform |
| **AWS Env** | Neo4j-graphiti-bot-env | context-platform-env |
| **Region** | us-east-1 | us-east-1 |
| **Platform** | Python 3.14 / Amazon Linux 2023 | Python 3.14 / Amazon Linux 2023 |
| **Entry point** | `gunicorn application:application` | Streamlit via supervisor |

### Where each external service lives

| Service | Provider | Where hosted |
|---|---|---|
| Neo4j graph database | Neo4j Aura (neo4j.com cloud) | External — NOT on AWS |
| Gemini embeddings + LLM | Google AI Studio (free tier) | External — Google Cloud |
| Groq LLM inference | Groq Cloud | External — Groq hardware |

Neo4j is **not on AWS**. It is a third-party cloud service our AWS app connects to over the internet,
similar to how an app connects to an external database.

### Environment Variables (set in AWS EB Console → Configuration → Software)

| Variable | Value |
|---|---|
| `NEO4J_URI` | `neo4j+s://374c3f2c.databases.neo4j.io` |
| `NEO4J_USERNAME` | `neo4j` |
| `NEO4J_PASSWORD` | Your Neo4j Aura password |
| `GEMINI_API_KEY` | From https://aistudio.google.com/apikey |
| `GROQ_API_KEY` | From https://console.groq.com |
| `FLASK_SECRET_KEY` | Any random string |

Credentials are **never written in the code**. They are environment variables in the EB console — completely secure.

### Deploy the Backend (this repo)

```bash
zip -r application.zip . -x "*.git*" -x "*venv*" -x "*__pycache__*" -x "*.env"
```
Upload `application.zip` → AWS EB Console → Neo4j-graphiti-bot-env → Upload and Deploy.

### Deploy the Frontend

See [`streamlit-ui/README.md`](./streamlit-ui/README.md) for full frontend deployment steps.

---

## API Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| `GET` | `/health` | Health check — returns `{"status": "ok"}` |
| `POST` | `/api/chat` | Main endpoint — auto-detects ingest vs query |
| `POST` | `/api/ingest` | Directly ingest a text episode |
| `POST` | `/api/query` | Directly query the graph |
| `POST` | `/api/ingest-file` | Upload and ingest a CSV or PDF |

---

## Repo Structure

```
highAccuracyFastAiAgents/
│
├── application.py          All Flask API routes
├── graphiti_service.py     Graphiti + n10s wrapper — ingest and search
├── ontology.py             n10s-style semantic ontology rules
├── requirements.txt        Python dependencies
├── Procfile                Gunicorn startup for Elastic Beanstalk
│
├── .ebextensions/
│   └── 01_environment.config   AWS environment variable declarations
│
├── static/                 Chat UI CSS and JavaScript
├── templates/              Chat UI HTML template
│
└── streamlit-ui/           Complete Streamlit frontend
    ├── streamlit_app.py    Main chat + file upload page
    ├── pages/              Sidebar wizard pages (Clients, Upload, etc.)
    ├── api/                Flask API routes for client management
    ├── utils/              API helper utilities
    └── README.md           Full frontend documentation
```

---

## Roadmap

### n10s Full Plugin (Next Sprint)
The current `ontology.py` applies semantic rules at the **Python application layer** after every Graphiti write.
The next upgrade is to install the true **neosemantics (n10s) Neo4j plugin** on a Neo4j Professional instance,
which enforces OWL/RDF ontology rules directly **at the database level** — making it impossible to write
semantically invalid data even if the application has a bug.

```
# Future: full n10s initialisation
CALL n10s.graphconfig.init()
CALL n10s.onto.import.inline(<OWL_TURTLE_STRING>, "Turtle")
```

### Sector-Specific Small Language Models (SLMs)
A general LLM does not deeply understand industry-specific abbreviations.
"CAR" means Capital Adequacy Ratio in Finance but means the vehicle in Automotive.

The plan: train small, private language models — one per sector — hosted securely on HuggingFace.
Finance clients use the Finance SLM. Healthcare clients use the Healthcare SLM.
Entity extraction accuracy becomes far higher because the model already speaks the language of that industry.

### Per-Sector Neo4j Instances
Instead of one shared Neo4j for all clients, each industry sector gets a dedicated Neo4j instance
pre-loaded with that sector's domain ontology.
The Finance graph already knows what a Bond, Portfolio, and Issuer are before any document is uploaded.
New clients in that sector get accurate retrieval from day one with zero manual configuration.

---

## Why This Beats Standard RAG

| Capability | Standard RAG | This System |
|---|---|---|
| Answer source | LLM guesses from document chunks | Neo4j graph traversal — deterministic |
| Accuracy | Probabilistic — can hallucinate | Validated graph edges — no hallucination |
| Token cost | Sends full page to LLM every query | Sends 2–3 bullet facts only |
| Inference speed | Slow — large prompts | Fast — tiny prompts via Groq LPU |
| Data privacy | Sent to public LLM (OpenAI, etc.) | Open-source model via Groq — no training data leakage |
| Audit trail | None | Bitemporal timestamps on every node |
| Data separation | Shared index | Per-client knowledge graph (multi-tenancy) |

---

## References

- [Full Architecture Document (Google Doc)](https://docs.google.com/document/d/1CLrvQRWzJqZcOdEudTX-Tkn9L5b1XHEDP_m1LU-jI3A/edit?usp=sharing)
- [Graphiti — Knowledge Graph for AI Agents](https://github.com/getzep/graphiti)
- [Neo4j Aura Free Cloud Database](https://neo4j.com/cloud/platform/aura-graph-database/)
- [neosemantics (n10s) — OWL/RDF on Neo4j](https://neo4j.com/labs/neosemantics/)
- [Google AI Studio — Free Gemini API](https://aistudio.google.com/apikey)
- [Groq — Fastest LLM Inference](https://console.groq.com)
- [Frontend README](./streamlit-ui/README.md)
