"use client";

import { useEffect, useState } from 'react';
import { Globe, FileText, Activity as ActivityIcon, Clock, RefreshCw } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchSignals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/signals');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.signals);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const handleGitHubSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Syncing with GitHub...');
    try {
      // 1. Pull the raw commits
      const syncRes = await fetch('/api/sources/github/sync', { method: 'POST' });
      const syncData = await syncRes.json();
      
      if (syncRes.ok) {
        setSyncMessage('Processing signals with Gemma...');
        
        // 2. Pass the new commits through the Relevance Engine (FR-13)
        await fetch('/api/ai/process-signals', { method: 'POST' });
        
        setSyncMessage(`${syncData.message} Filtering complete.`);
        await fetchSignals(); // Refresh the feed to show updated data
      } else {
        setSyncMessage(syncData.error || 'Sync failed.');
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncMessage('Error syncing with GitHub.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000); 
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'github': return <FaGithub className="w-4 h-4" />;
      case 'browser': return <Globe className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <ActivityIcon className="w-4 h-4" />;
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'github': return 'text-slate-700 bg-slate-100';
      case 'browser': return 'text-blue-600 bg-blue-50';
      case 'document': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-stone-600 bg-stone-100';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 lg:p-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Activity</h1>
          <p className="text-slate-500 mt-2">The raw signals and AI inferences feeding your Desk.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleGitHubSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync GitHub'}
          </button>
          {syncMessage && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              {syncMessage}
            </span>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="text-slate-400">Loading activity feed...</div>
      ) : activities.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500 bg-slate-50">
          No activity recorded yet. Click "Sync GitHub" to pull your recent commits.
        </div>
      ) : (
        <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-8 mt-8">
          {activities.map((activity) => (
            <div key={activity._id} className="relative pl-8">
              <div className={`absolute -left-4 top-1 p-1.5 rounded-full ring-4 ring-white ${getSourceColor(activity.sourceType)}`}>
                {getSourceIcon(activity.sourceType)}
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    {activity.sourceType}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Clock className="w-3 h-3" /> 
                    {new Date(activity.timestamp).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {activity.metadata?.description || "Signal recorded"}
                </p>
                {activity.metadata?.repo && (
                  <p className="text-xs text-slate-500 mt-1">
                    Repository: <span className="font-medium text-slate-700">{activity.metadata.repo}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}