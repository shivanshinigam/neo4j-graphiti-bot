'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  Database, 
  Bot, 
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, step: 'P0' },
  { id: 'clients', label: '1. Clients', icon: Users, step: 'STEP 1' },
  { id: 'upload', label: '2. Data Ingestion', icon: UploadCloud, step: 'STEP 2' },
  { id: 'context', label: '3. Context Store', icon: Database, step: 'STEP 3' },
  { id: 'agents', label: '4. AI Agents', icon: Bot, step: 'STEP 4' },
  { id: 'telemetry', label: '5. Telemetry Hub', icon: Activity, step: 'HUB' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="px-3 py-4 mb-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              C
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base tracking-tight">ContextOS</h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Enterprise Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform Modules</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">System Online</span>
        </div>
        <p className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>API Engine v1.0</span>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        </p>
      </div>
    </aside>
  );
}
