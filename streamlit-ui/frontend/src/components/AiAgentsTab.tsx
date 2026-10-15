'use client';

import React, { useState, useEffect } from 'react';
import { triggerAgentJob, fetchAgentJobs } from '@/lib/api';
import { Bot, Play, RefreshCw, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

interface AiAgentsTabProps {
  onNavigateNext: () => void;
}

export default function AiAgentsTab({ onNavigateNext }: AiAgentsTabProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'trigger' | 'monitor'>('trigger');

  // Form State
  const [clientId, setClientId] = useState('');
  const [contextId, setContextId] = useState('');
  const [agentType, setAgentType] = useState('recommendation');
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0.8);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    const res = await fetchAgentJobs();
    setJobs(res.jobs || []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !contextId) {
      setMsg({ type: 'error', text: 'Client ID and Context ID are required' });
      return;
    }
    setSubmitting(true);
    setMsg(null);

    const res = await triggerAgentJob({
      client_id: clientId,
      context_id: contextId,
      agent_type: agentType,
      config: { top_k: topK, threshold },
    });
    setSubmitting(false);

    if (res.success) {
      setMsg({ type: 'success', text: `Agent Job queued! Job ID: ${res.job_id}` });
      loadJobs();
      setActiveTab('monitor');
    } else {
      setMsg({ type: 'error', text: res.error || 'Trigger failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-2">
            STEP 4 OF 4 | AI AGENT JOBS
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Autonomous AI Agent Control Panel</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Orchestrate AI agents (Data Enrichment, Anomaly Detection, Recommendations, Summarization) against ingested context payloads.
          </p>
        </div>
        <button
          onClick={onNavigateNext}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/25 transition"
        >
          <span>Proceed to Telemetry Hub</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('trigger')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'trigger'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Launch Agent Job</span>
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'monitor'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Job Monitor & Telemetry ({jobs.length})</span>
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {msg.text}
        </div>
      )}

      {activeTab === 'trigger' ? (
        <form onSubmit={handleTrigger} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Client ID *</label>
              <input
                type="text"
                placeholder="e.g. client_d307b5c989b8"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target Context ID *</label>
              <input
                type="text"
                placeholder="Paste context_id from Context Store"
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">AI Agent Model / Service</label>
              <select
                value={agentType}
                onChange={(e) => setAgentType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="recommendation">Recommendation Agent</option>
                <option value="summarization">Summarization Agent</option>
                <option value="anomaly_detection">Anomaly Detection Agent</option>
                <option value="data_enrichment">Data Enrichment Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Top K (Recommendations Count)</label>
              <input
                type="number"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {submitting ? 'Triggering Agent...' : 'Trigger Agent Execution'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-400 font-mono">Workloads Log ({jobs.length})</p>
            <button onClick={loadJobs} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Jobs
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              No agent jobs executed yet. Trigger one above!
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: any) => {
                const res = job.result || {};
                return (
                  <div key={job.job_id} className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm capitalize">{job.agent_type?.replace('_', ' ')} Agent</h4>
                          <p className="text-xs text-slate-400 font-mono">Job ID: {job.job_id}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        {job.status || 'COMPLETED'}
                      </span>
                    </div>

                    {/* AI Agent Generated Intelligence Card */}
                    {res && (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>Generated AI Intelligence</span>
                        </div>

                        {res.executive_summary && (
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                            {res.executive_summary}
                          </p>
                        )}

                        {res.recommended_actions && (
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold text-slate-400">Recommended Business Actions:</p>
                            {res.recommended_actions.map((act: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {res.flagged_anomalies && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-semibold text-amber-400">Flagged Anomalies ({res.anomalies_detected}):</p>
                            {res.flagged_anomalies.map((anom: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
                                <span className="font-bold">{anom.type}</span> on <code className="font-mono text-slate-200">{anom.item_id}</code>: {anom.details}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
