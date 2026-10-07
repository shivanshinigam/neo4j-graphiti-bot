"""
application.py - Async Flask app for AWS Elastic Beanstalk.

Uses a single persistent asyncio event loop (via nest_asyncio + asyncio.get_event_loop)
so the neo4j async driver's connections are never orphaned across request boundaries.
"""

import os
import io
import asyncio
import logging
import re
import requests
from datetime import datetime

import pandas as pd
import PyPDF2

from flask import Flask, request, jsonify, render_template

def _synthesize_answer(query: str, results: list, api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}"}
    context = "\n".join([f"- {r['fact']}" for r in results])
    
    prompt = f"""You are a highly intelligent, professional AI assistant connected to a Knowledge Graph.
User's message: "{query}"

Retrieved context from the Knowledge Graph:
{context}

Instructions:
1. If the user's message is a simple greeting (e.g., "hi", "hello", "hey"), just greet them back professionally. Do NOT mention or list the retrieved context.
2. If the user is asking a question, answer it directly and concisely using ONLY the relevant facts from the retrieved context.
3. Do not just dump the raw facts. Synthesize a natural, conversational answer.
4. If the retrieved context does not contain the answer, politely state that you do not know or do not have that information in your knowledge graph."""

    data = {
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0.3
    }
    try:
        r = requests.post(url, headers=headers, json=data, timeout=10)
        if r.ok:
            return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        pass
        
    # Fallback to dumping facts if synthesis fails
    lines = [f"- {r['fact']}" for r in results[:3]]
    return "Here's what I found:\n" + "\n".join(lines)
from graphiti_service import GraphitiService

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Flask App (must be named `application` for Elastic Beanstalk) ─────────────
application = Flask(__name__)
application.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key-change-me")

# ── Fresh Event Loop Runner (bypasses nest_asyncio patching asyncio.run) ──────
def run_fresh(coro):
    """
    Create a brand-new, unpatched event loop and run the coroutine on it.
    This bypasses nest_asyncio which patches asyncio.run() at module level,
    causing Lock conflicts in the neo4j async driver on Python 3.14+.
    """
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        try:
            loop.run_until_complete(loop.shutdown_asyncgens())
        except Exception:
            pass
        loop.close()


async def _async_ingest(name: str, content: str) -> None:
    svc = GraphitiService(
        uri=os.environ.get("NEO4J_URI", "neo4j+s://374c3f2c.databases.neo4j.io"),
        username=os.environ.get("NEO4J_USERNAME", "neo4j"),
        password=os.environ.get("NEO4J_PASSWORD", "dIe43mKUBPfA8XNpomJX_MRXAZ059EBQRkZszhhOLrc"),
        gemini_api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE"),
        groq_api_key=os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE"),
    )
    try:
        await svc.initialise()
        await svc.ingest(name=name, content=content)
    finally:
        await svc.close()

async def _async_search(query: str):
    svc = GraphitiService(
        uri=os.environ.get("NEO4J_URI", "neo4j+s://374c3f2c.databases.neo4j.io"),
        username=os.environ.get("NEO4J_USERNAME", "neo4j"),
        password=os.environ.get("NEO4J_PASSWORD", "dIe43mKUBPfA8XNpomJX_MRXAZ059EBQRkZszhhOLrc"),
        gemini_api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE"),
        groq_api_key=os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE"),
    )
    try:
        await svc.initialise()
        return await svc.search(query)
    finally:
        await svc.close()


# ── Intent Detection ──────────────────────────────────────────────────────────
INGEST_RE = re.compile(
    r"^(remember\s+that|add\s+(fact|info|data|episode)[:\s]+|note\s+that|"
    r"store|ingest[:\s]+|save|learn\s+that|record\s+that)\s*",
    re.IGNORECASE,
)


def detect_ingest_intent(message: str) -> tuple[bool, str]:
    cleaned = INGEST_RE.sub("", message.strip(), count=1).strip()
    return bool(INGEST_RE.match(message.strip())), cleaned


# ── Routes ────────────────────────────────────────────────────────────────────

@application.route("/")
def index():
    return render_template("index.html")


@application.route("/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@application.route("/api/ingest", methods=["POST"])
def api_ingest():
    body    = request.get_json(force=True, silent=True) or {}
    content = (body.get("content") or "").strip()
    name    = (body.get("name") or f"Episode-{datetime.utcnow().isoformat()}").strip()

    if not content:
        return jsonify({"error": "Field 'content' is required."}), 400

    try:
        run_fresh(_async_ingest(name=name, content=content))
        logger.info("Ingested episode '%s'.", name)
        return jsonify({"status": "ingested", "name": name, "content": content})
    except Exception as exc:
        logger.exception("Ingest failed: %s", exc)
        return jsonify({"error": str(exc)}), 500


@application.route("/api/query", methods=["POST"])
def api_query():
    body  = request.get_json(force=True, silent=True) or {}
    query = (body.get("query") or "").strip()

    if not query:
        return jsonify({"error": "Field 'query' is required."}), 400

    try:
        results = run_fresh(_async_search(query))
        return jsonify({"query": query, "results": results})
    except Exception as exc:
        logger.exception("Query failed: %s", exc)
        return jsonify({"error": str(exc)}), 500


@application.route("/api/chat", methods=["POST"])
def api_chat():
    body    = request.get_json(force=True, silent=True) or {}
    message = (body.get("message") or "").strip()

    if not message:
        return jsonify({"error": "Field 'message' is required."}), 400

    is_ingest, payload = detect_ingest_intent(message)

    try:
        if is_ingest:
            episode_name = f"Chat-{datetime.utcnow().isoformat()}"
            run_fresh(_async_ingest(name=episode_name, content=payload))
            return jsonify({
                "intent": "ingest",
                "reply": f'Stored in the knowledge graph:\n\n*"{payload}"*',
                "stored_content": payload,
            })
        else:
            results = run_fresh(_async_search(payload))
            if not results:
                reply = (
                    "I searched the knowledge graph but couldn't find anything "
                    "relevant. Try adding some facts first."
                )
            else:
                groq_api_key = os.environ.get("GROQ_API_KEY", "")
                reply = _synthesize_answer(payload, results, groq_api_key)

            return jsonify({
                "intent": "query",
                "reply": reply,
                "results": results,
            })

    except Exception as exc:
        logger.exception("Chat error: %s", exc)
        return jsonify({"error": str(exc)}), 500


@application.route("/api/ingest-file", methods=["POST"])
def api_ingest_file():
    """
    Accepts a CSV or PDF file upload, extracts text, and ingests each
    row/page as a separate Graphiti episode into Neo4j.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    uploaded_file = request.files["file"]
    filename      = uploaded_file.filename or "unknown"
    file_bytes    = uploaded_file.read()
    ext           = filename.rsplit(".", 1)[-1].lower()
    episodes      = []  # list of (name, content) tuples to ingest

    try:
        if ext == "csv":
            # Read CSV and convert each row into a readable text sentence
            df = pd.read_csv(io.BytesIO(file_bytes))
            for i, row in df.iterrows():
                row_text = ", ".join([f"{col}: {val}" for col, val in row.items() if str(val).strip()])
                episodes.append((f"{filename}-row-{i+1}", row_text))

        elif ext == "pdf":
            # Read PDF and convert each page into a separate episode
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                text = text.strip()
                if text:
                    episodes.append((f"{filename}-page-{i+1}", text))

        else:
            return jsonify({"error": f"Unsupported file type: .{ext}. Please upload a CSV or PDF."}), 400

        if not episodes:
            return jsonify({"error": "File was empty or could not be parsed."}), 400

        # Ingest all episodes into Graphiti / Neo4j
        ingested = 0
        for name, content in episodes:
            try:
                run_fresh(_async_ingest(name=name, content=content))
                ingested += 1
            except Exception as ep_err:
                logger.warning("Skipped episode '%s': %s", name, ep_err)

        return jsonify({
            "status": "success",
            "filename": filename,
            "total_episodes": len(episodes),
            "ingested": ingested,
            "message": f"Successfully ingested {ingested} of {len(episodes)} sections from '{filename}' into the knowledge graph."
        })

    except Exception as exc:
        logger.exception("File ingestion failed: %s", exc)
        return jsonify({"error": str(exc)}), 500


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    application.run(host="0.0.0.0", port=port, debug=False)
