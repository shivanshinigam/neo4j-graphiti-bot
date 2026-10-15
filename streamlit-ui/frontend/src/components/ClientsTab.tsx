'use client';

import React, { useState, useEffect } from 'react';
import { fetchClients, registerClient } from '@/lib/api';
import { UserPlus, Building2, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

interface ClientsTabProps {
  onNavigateNext: () => void;
}

export default function ClientsTab({ onNavigateNext }: ClientsTabProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'register' | 'list'>('register');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('retail');
  const [awsAccount, setAwsAccount] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [plan, setPlan] = useState('enterprise');

  const loadData = async () => {
    setLoading(true);
    const res = await fetchClients();
    setClients(res.clients || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setMsg({ type: 'error', text: 'Company Name and Contact Email are required' });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    const res = await registerClient({
      name,
      email,
      industry,
      aws_account_id: awsAccount,
      aws_region: awsRegion,
      plan,
    });
    setSubmitting(false);

    if (res.success) {
      setMsg({ type: 'success', text: `Client registered successfully! Client ID: ${res.client_id}` });
      setName('');
      setEmail('');
      setAwsAccount('');
      loadData();
    } else {
      setMsg({ type: 'error', text: res.error || 'Registration failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-2">
            STEP 1 OF 4 | CLIENT ONBOARDING
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Client Directory & Registration</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Onboard enterprise clients, record their AWS infrastructure parameters, and set active service tiers.
          </p>
        </div>
        <button
          onClick={onNavigateNext}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/25 transition"
        >
          <span>Proceed to Data Ingestion</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'register'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'list'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Registered Clients ({clients.length})</span>
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {activeTab === 'register' ? (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Company / Client Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme Retail Solutions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Contact Email *</label>
              <input
                type="email"
                placeholder="e.g. admin@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Industry Domain</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="retail">Retail</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="logistics">Logistics</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Client AWS Account ID</label>
              <input
                type="text"
                placeholder="e.g. 123456789012"
                value={awsAccount}
                onChange={(e) => setAwsAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Primary AWS Region</label>
              <select
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="us-east-1">us-east-1</option>
                <option value="us-west-2">us-west-2</option>
                <option value="ap-south-1">ap-south-1</option>
                <option value="eu-west-1">eu-west-1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Service Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Client'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-400">Total Active Roster: {clients.length}</p>
            <button onClick={loadData} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              No registered clients found. Use the form above to onboard your first client.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((c: any) => (
                <div key={c.client_id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{c.name}</h3>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {c.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <div>Industry: <span className="text-slate-200 capitalize">{c.industry}</span></div>
                    <div>Plan: <span className="text-slate-200 capitalize">{c.plan}</span></div>
                    <div>AWS Account: <code className="text-slate-300 font-mono">{c.aws_account_id || 'N/A'}</code></div>
                    <div>ID: <code className="text-blue-400 font-mono">{c.client_id}</code></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
