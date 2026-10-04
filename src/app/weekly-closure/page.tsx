"use client";

import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, GitCommit, Activity, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function WeeklyClosurePage() {
  const [loops, setLoops] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loopsRes, signalsRes] = await Promise.all([
          fetch('/api/loops'),
          fetch('/api/signals')
        ]);

        if (loopsRes.ok) {
          const data = await loopsRes.json();
          setLoops(data.loops || []);
        }

        if (signalsRes.ok) {
          const data = await signalsRes.json();
          setSignals(data.signals || []);
        }
      } catch (error) {
        console.error("Failed to fetch weekly data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter signals within the last 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentGithubSignals = signals.filter(
    (s: any) => s.sourceType === 'github' && new Date(s.timestamp) >= oneWeekAgo
  );

  // Total commits recorded across all push events this week
  const totalCommits = recentGithubSignals.reduce((acc: number, s: any) => {
    return acc + (s.metadata?.commits || 0);
  }, 0);

  // Group commits by repository
  const repoActivityMap: Record<string, { commits: number; lastActive: string }> = {};
  recentGithubSignals.forEach((s: any) => {
    const repo = s.metadata?.repo || 'Unknown Repository';
    if (!repoActivityMap[repo]) {
      repoActivityMap[repo] = { commits: 0, lastActive: s.timestamp };
    }
    repoActivityMap[repo].commits += s.metadata?.commits || 0;
  });

  const activeRepos = Object.entries(repoActivityMap);

  const stats = {
    started: loops.length,
    closed: loops.filter((l: any) => l.state === 'closed').length,
    parked: loops.filter((l: any) => l.state === 'parked').length,
    active: loops.filter((l: any) => l.state === 'active' || l.state === 'inbox').length,
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400">Loading your week...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Weekly Closure</h1>
        <p className="text-slate-500 mt-2">Activity summary from your connected sources and Desk.</p>
      </header>

      {/* Dynamic Loop Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-semibold text-slate-900 mb-1">{stats.started}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tracked</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-semibold text-emerald-700 mb-1">{stats.closed}</p>
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Closed</p>
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-semibold text-stone-700 mb-1">{stats.parked}</p>
          <p className="text-xs font-medium text-stone-600 uppercase tracking-wider">Parked</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-semibold text-blue-700 mb-1">{stats.active}</p>
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Still Active</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Real GitHub Activity Summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              NOTABLE REPOSITORY ACTIVITY
            </h2>
            {totalCommits > 0 && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {totalCommits} total commit{totalCommits === 1 ? '' : 's'} recorded
              </span>
            )}
          </div>

          {activeRepos.length === 0 ? (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-500 text-center">
              No recent repository activity found in the last 7 days. Go to the Activity tab and click "Sync GitHub".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRepos.map(([repoName, data]) => (
                <div key={repoName} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-semibold text-slate-900">{repoName}</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      {data.commits} commit{data.commits === 1 ? '' : 's'} pushed this week
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(data.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          Back to Desk
        </Link>
      </div>
    </div>
  );
}