'use client';

import React, { useState } from 'react';
import { uploadFileDirect } from '@/lib/api';
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface DataUploadTabProps {
  onNavigateNext: () => void;
}

export default function DataUploadTab({ onNavigateNext }: DataUploadTabProps) {
  const [clientId, setClientId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string; details?: any } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setMsg({ type: 'error', text: 'Client ID is required' });
      return;
    }
    if (!file) {
      setMsg({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setUploading(true);
    setMsg(null);
    const res = await uploadFileDirect(clientId, file);
    setUploading(false);

    if (res.success) {
      setMsg({
        type: 'success',
        text: `File ingested! Context ID: ${res.context_id}`,
        details: res.context_entry,
      });
      setFile(null);
    } else {
      setMsg({ type: 'error', text: res.error || 'Upload failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-2">
            STEP 2 OF 4 | CLIENT DATA INGESTION
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Client Data Upload & S3 Ingestion</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Ingest client dataset files into ContextOS. Select from direct drag & drop file upload, presigned S3 URLs, or STS keys.
          </p>
        </div>
        <button
          onClick={onNavigateNext}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/25 transition"
        >
          <span>Proceed to Context Store</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex flex-col gap-2 text-xs font-semibold ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div className="flex items-center gap-3">
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
          {msg.details && (
            <pre className="mt-2 p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto">
              {JSON.stringify(msg.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Drag & Drop Upload Container */}
      <form onSubmit={handleUpload} className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Client ID *</label>
          <input
            type="text"
            placeholder="e.g. client_d307b5c989b8"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full md:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Select Dataset File (CSV, JSON, TXT, PDF)</label>
          <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 text-center bg-slate-950/40 transition cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv,.json,.txt,.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 font-semibold">
                <FileText className="w-4 h-4" />
                <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-300">Drag and drop file here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Supports sample_client_data.txt, sample_products.csv, sample_context.json</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
          >
            {uploading ? 'Ingesting File...' : 'Upload File to Context Platform'}
          </button>
        </div>
      </form>
    </div>
  );
}
