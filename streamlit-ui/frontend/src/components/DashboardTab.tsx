'use client';

import React, { useState, useEffect } from 'react';
import { fetchClients, fetchContextEntries, fetchAgentJobs } from '@/lib/api';
import { Users, Database, Bot, Activity, RefreshCw } from 'lucide-react';

export default function DashboardTab() {
  const [clientCount, setClientCount] = useState(0);
  const [contextCount, setContextCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    const [c, ctx, j] = await Promise.all([
      fetchClients(),
      fetchContextEntries(),
      fetchAgentJobs(),
    ]);
    setClientCount(c.clients?.length || 0);
    setContextCount(ctx.context_entries?.length || 0);
    setJobsCount(j.jobs?.length || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-2">
            PLATFORM OPERATIONS HUB
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">ContextOS Telemetry & Operations Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Central monitoring hub providing real-time visibility into enterprise clients, ingested context objects, and active AI agent jobs.
          </p>
        </div>
        <button
          onClick={loadMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Clients</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{clientCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Context Objects Stored</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{contextCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total AI Agent Jobs</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{jobsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bot className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
