'use client';

import React from 'react';
import { Users, UploadCloud, Database, Bot, Activity, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export default function OverviewTab({ onNavigateTab }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase">
            <Zap className="w-3.5 h-3.5" /> Next.js Phase 2 Enterprise Web App
          </div>
          <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            ContextOS <span className="gradient-text">Enterprise AI Platform</span>
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            The bridge between enterprise client datasets and autonomous AI agents. Securely ingest, structure, and orchestrate client context at scale.
          </p>
        </div>
      </div>

      {/* 4-Step Interactive Pipeline Guide */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-100">End-to-End Execution Pipeline</h3>
            <p className="text-xs text-slate-400">Click any module below to navigate directly to that stage:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTab('clients')}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">STEP 1</span>
              <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition" />
            </div>
            <h4 className="font-bold text-slate-100 text-sm">1. Client Onboarding</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Onboard clients, record AWS account IDs, and set active service tiers.</p>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition pt-2">
              <span>Go to Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('upload')}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">STEP 2</span>
              <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition" />
            </div>
            <h4 className="font-bold text-slate-100 text-sm">2. Data Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Direct Drag & Drop, presigned S3 URLs, temporary STS keys, or IAM roles.</p>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition pt-2">
              <span>Go to Ingestion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('context')}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">STEP 3</span>
              <Database className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition" />
            </div>
            <h4 className="font-bold text-slate-100 text-sm">3. Context Store</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Inspect and query structured context payloads stored in ContextOS.</p>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition pt-2">
              <span>Go to Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('agents')}
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition cursor-pointer group space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">STEP 4</span>
              <Bot className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition" />
            </div>
            <h4 className="font-bold text-slate-100 text-sm">4. AI Agent Jobs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Run Summarization, Recommendation, and Anomaly Detection agents.</p>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition pt-2">
              <span>Go to Agents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
