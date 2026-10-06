/**
 * chat.js — GraphitiBot frontend logic
 *
 * Modes:
 *  - "chat"   → POST /api/chat  (auto-detect ingest vs query)
 *  - "ingest" → POST /api/ingest (explicit ingest form)
 *  - "query"  → POST /api/query  (explicit query)
 */

'use strict';

/* ── DOM Refs ──────────────────────────────────────────────────────────────── */
const messagesEl   = document.getElementById('messages-container');
const inputEl      = document.getElementById('user-input');
const sendBtn      = document.getElementById('send-btn');
const clearBtn     = document.getElementById('clear-btn');
const sidebarEl    = document.getElementById('sidebar');
const sidebarToggle= document.getElementById('sidebar-toggle');
const statusDot    = document.getElementById('status-dot');
const statusLabel  = document.getElementById('status-label');
const modeSubtitle = document.getElementById('mode-subtitle');
const navItems     = document.querySelectorAll('.nav-item');

/* ── State ─────────────────────────────────────────────────────────────────── */
let currentMode = 'chat';   // 'chat' | 'ingest' | 'query'
let isLoading   = false;

const MODE_META = {
  chat:   { subtitle: 'Chat mode — I\'ll auto-detect ingest vs. query', placeholder: 'Ask a question or say "remember that…" to add a fact…' },
  ingest: { subtitle: 'Ingest mode — Everything you type is stored as a fact', placeholder: 'Type a fact to store, e.g. "Alice is a Lead Engineer at Acme Corp."' },
  query:  { subtitle: 'Query mode — Ask anything about the knowledge graph', placeholder: 'Ask a question, e.g. "What project is Alice working on?"' },
};

/* ── Markdown-lite renderer ────────────────────────────────────────────────── */
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

/* ── Message helpers ───────────────────────────────────────────────────────── */
function appendMessage(role, html, badge = null) {
  /** role: 'user' | 'bot' | 'system' */
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', role);

  if (role !== 'system') {
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = role === 'user' ? '🧑' : '🤖';
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  if (badge) {
    const b = document.createElement('div');
    b.classList.add('intent-badge', `badge-${badge.type}`);
    b.textContent = badge.label;
    bubble.appendChild(b);
    bubble.appendChild(document.createElement('br'));
  }

  const content = document.createElement('div');
  content.innerHTML = html;
  bubble.appendChild(content);
  wrapper.appendChild(bubble);

  messagesEl.appendChild(wrapper);
  scrollToBottom();
  return bubble;
}

function appendTypingIndicator() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', 'bot');
  wrapper.id = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderQueryResults(results) {
  if (!results || results.length === 0) return '';
  return results.map((r, i) => {
    const score = r.score != null ? r.score.toFixed(3) : 'N/A';
    return `<div class="fact-card">
      <div class="fact-num">Result ${i + 1}</div>
      <div>${renderMarkdown(r.fact || String(r))}</div>
      <div class="fact-score">Relevance: ${score}</div>
    </div>`;
  }).join('');
}

/* ── API calls ─────────────────────────────────────────────────────────────── */
async function callAPI(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  setLoading(true);
  inputEl.value = '';
  autoResizeTextarea();

  appendMessage('user', renderMarkdown(text));
  appendTypingIndicator();

  try {
    let data, badgeType, html;

    if (currentMode === 'ingest') {
      data = await callAPI('/api/ingest', { name: `Chat-${Date.now()}`, content: text });
      badgeType = { type: 'ingest', label: '📥 Stored' };
      html = `✅ Stored in the knowledge graph:<br><br><em>"${renderMarkdown(data.content)}"</em>`;

    } else if (currentMode === 'query') {
      data = await callAPI('/api/query', { query: text });
      badgeType = { type: 'query', label: '🔍 Query' };
      if (!data.results || data.results.length === 0) {
        html = '🔍 No matching facts found in the graph. Try adding some first!';
      } else {
        html = `Found <strong>${data.results.length}</strong> result(s):<br><br>${renderQueryResults(data.results)}`;
      }

    } else {
      // Auto-detect (chat) mode
      data = await callAPI('/api/chat', { message: text });
      if (data.intent === 'ingest') {
        badgeType = { type: 'ingest', label: '📥 Stored' };
        html = renderMarkdown(data.reply);
      } else {
        badgeType = { type: 'query', label: '🔍 Query' };
        // Render structured fact cards if results available
        if (data.results && data.results.length > 0) {
          html = `Here's what I found in the knowledge graph:<br><br>${renderQueryResults(data.results)}`;
        } else {
          html = renderMarkdown(data.reply);
        }
      }
    }

    removeTypingIndicator();
    appendMessage('bot', html, badgeType);
    setStatus('online', 'Connected');

  } catch (err) {
    removeTypingIndicator();
    const errHtml = `⚠️ <strong>Error:</strong> ${err.message}`;
    appendMessage('bot', errHtml, { type: 'error', label: '⚠️ Error' });
    setStatus('error', 'Error');
    console.error('[GraphitiBot]', err);
  } finally {
    setLoading(false);
  }
}

/* ── UI helpers ────────────────────────────────────────────────────────────── */
function setLoading(flag) {
  isLoading = flag;
  sendBtn.disabled = flag || inputEl.value.trim() === '';
  inputEl.disabled = flag;
}

function setStatus(state, label) {
  statusDot.className = `status-dot ${state}`;
  statusLabel.textContent = label;
}

function setMode(mode) {
  currentMode = mode;
  const meta = MODE_META[mode];
  modeSubtitle.textContent = meta.subtitle;
  inputEl.placeholder = meta.placeholder;

  navItems.forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  appendMessage('system', `Switched to <strong>${mode}</strong> mode.`);
}

function autoResizeTextarea() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
}

function showWelcome() {
  const html = `
    👋 <strong>Welcome to GraphitiBot!</strong><br><br>
    I'm connected to a <strong>Neo4j Aura</strong> knowledge graph via <strong>Graphiti</strong>.<br><br>
    <strong>To store facts:</strong> start with <code>remember that</code>, <code>add fact:</code>, or <code>note that</code><br>
    <strong>To query:</strong> just ask a question naturally<br><br>
    Try: <em>"Remember that Alice is a Lead Engineer working on the Gemini Project"</em>
  `;
  appendMessage('bot', html);
}

/* ── Health check ──────────────────────────────────────────────────────────── */
async function checkHealth() {
  try {
    const res = await fetch('/health');
    if (res.ok) {
      setStatus('online', 'Connected');
    } else {
      setStatus('error', 'Service error');
    }
  } catch {
    setStatus('error', 'Offline');
  }
}

/* ── Event Listeners ───────────────────────────────────────────────────────── */
sendBtn.addEventListener('click', sendMessage);

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

inputEl.addEventListener('input', () => {
  autoResizeTextarea();
  sendBtn.disabled = isLoading || inputEl.value.trim() === '';
});

clearBtn.addEventListener('click', () => {
  messagesEl.innerHTML = '';
  showWelcome();
});

sidebarToggle.addEventListener('click', () => {
  const collapsed = sidebarEl.classList.toggle('collapsed');
  sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
});

navItems.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

/* ── Startup ───────────────────────────────────────────────────────────────── */
showWelcome();
checkHealth();
// Re-check health every 30s
setInterval(checkHealth, 30_000);
