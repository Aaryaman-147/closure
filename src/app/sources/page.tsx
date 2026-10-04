"use client";

import { Globe, FileText, CheckCircle2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import Link from 'next/link';

export default function SourcesPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sources</h1>
        <p className="text-slate-500 mt-2">Connect platforms to let Closure observe relevant activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Source */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <FaGithub className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">GitHub</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">Observe recent commits, PRs, and repository activity.</p>
          </div>
          <Link 
            href="/activity"
            className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Manage Connection & Sync
          </Link>
        </div>

        {/* Browser Extension Source */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                <Globe className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Side-loaded
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Browser Extension</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">Collect metadata from approved domains like LeetCode and YouTube.</p>
          </div>
          <Link 
            href="/settings"
            className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Manage Domain Permissions
          </Link>
        </div>

        {/* Documents Source */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Active in App
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">Ingest PDFs, course outlines, and challenge rules.</p>
          </div>
          <Link 
            href="/documents"
            className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Upload Documents
          </Link>
        </div>
      </div>
    </div>
  );
}