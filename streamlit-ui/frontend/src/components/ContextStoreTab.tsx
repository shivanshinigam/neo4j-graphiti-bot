'use client';

import React, { useState, useEffect } from 'react';
import { fetchContextEntries } from '@/lib/api';
import { Database, Search, RefreshCw, ArrowRight, Code } from 'lucide-react';

interface ContextStoreTabProps {
  onNavigateNext: () => void;
}

export default function ContextStoreTab({ onNavigateNext }: ContextStoreTabProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const loadEntries = async () => {
    setLoading(true);
    const res = await fetchContextEntries(filterClient || undefined);
    setEntries(res.context_entries || []);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-2">
            STEP 3 OF 4 | CONTEXT STORE
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Context Store & Payload Explorer</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Inspect, query, and manage structured context payloads stored in ContextOS.
          </p>
        </div>
        <button
          onClick={onNavigateNext}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/25 transition"
        >
          <span>Proceed to AI Agents</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter by Client ID..."
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={loadEntries}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Store</span>
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No context entries stored yet. Ingest a dataset in Step 2 to get started.
          </div>
        ) : (
          entries.map((item: any) => (
            <div
              key={item.context_id}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                    {item.context_type?.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">Client ID: <code className="text-slate-200 font-mono">{item.client_id}</code></p>
                </div>
                <code className="text-[10px] bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800">
                  {item.context_id}
                </code>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                <pre className="text-[11px] font-mono text-slate-300">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                <span>Created: {item.created_at?.slice(0, 19)} UTC</span>
                <span>Tags: {item.tags?.join(', ') || 'none'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
