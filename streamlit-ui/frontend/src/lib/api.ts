const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function fetchClients() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/clients/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message, clients: [] };
  }
}

export async function registerClient(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/clients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadFileDirect(clientId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('client_id', clientId);
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/v1/uploads/direct`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchContextEntries(clientId?: string, type?: string) {
  try {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    if (type) params.append('type', type);

    const res = await fetch(`${API_BASE}/api/v1/context/list?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message, context_entries: [] };
  }
}

export async function uploadContextManual(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/context/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function triggerAgentJob(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchAgentJobs() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/jobs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message, jobs: [] };
  }
}
