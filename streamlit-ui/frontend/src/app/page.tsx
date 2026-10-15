'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OverviewTab from '@/components/OverviewTab';
import ClientsTab from '@/components/ClientsTab';
import DataUploadTab from '@/components/DataUploadTab';
import ContextStoreTab from '@/components/ContextStoreTab';
import AiAgentsTab from '@/components/AiAgentsTab';
import DashboardTab from '@/components/DashboardTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {activeTab === 'overview' && <OverviewTab onNavigateTab={(t) => setActiveTab(t)} />}
          {activeTab === 'clients' && <ClientsTab onNavigateNext={() => setActiveTab('upload')} />}
          {activeTab === 'upload' && <DataUploadTab onNavigateNext={() => setActiveTab('context')} />}
          {activeTab === 'context' && <ContextStoreTab onNavigateNext={() => setActiveTab('agents')} />}
          {activeTab === 'agents' && <AiAgentsTab onNavigateNext={() => setActiveTab('telemetry')} />}
          {activeTab === 'telemetry' && <DashboardTab />}
        </main>
      </div>
    </div>
  );
}
