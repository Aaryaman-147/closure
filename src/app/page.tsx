"use client";

import { useState, useEffect, useCallback } from 'react';
import { Layers, Plus } from 'lucide-react';
import LoopCard from '@/components/desk/LoopCard';
import BrainDumpModal from '@/components/desk/BrainDumpModal';
import CleanMyDeskModal from '@/components/desk/CleanMyDeskModal';
import EditLoopModal from '@/components/desk/EditLoopModal';

interface Loop {
  _id: string;
  title: string;
  type: string;
  state: 'inbox' | 'active' | 'parked' | 'closed';
  attention: 'high' | 'medium' | 'low';
  deadline?: string;
}

export default function DeskPage() {
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [isCleanDeskOpen, setIsCleanDeskOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLoop, setSelectedLoop] = useState<any>(null);
  
  const [loops, setLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoops = useCallback(async () => {
    try {
      const res = await fetch('/api/loops');
      if (res.ok) {
        const data = await res.json();
        setLoops(data.loops);
      }
    } catch (error) {
      console.error("Failed to fetch loops:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoops();
  }, [fetchLoops]);

  const inboxLoops = loops.filter(l => l.state === 'inbox');
  const activeLoops = loops.filter(l => l.state === 'active');
  const parkedLoops = loops.filter(l => l.state === 'parked');
  const closedLoops = loops.filter(l => l.state === 'closed');

  if (isLoading) {
    return <div className="max-w-6xl mx-auto p-12 text-slate-400">Loading your Desk...</div>;
  }

  if (loops.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 lg:p-12 h-[80vh] flex flex-col justify-center items-center text-center">
        <div className="bg-indigo-50 p-4 rounded-2xl mb-6">
          <Layers className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
          Welcome to Closure
        </h1>
        <p className="text-lg text-slate-500 mb-8 max-w-lg">
          Your desk is completely clear. Let's start by getting everything out of your head and into your workspace.
        </p>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedLoop(null); setIsEditModalOpen(true); }}
            className="flex justify-center items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Loop Manually
          </button>
          <button 
            onClick={() => setIsBrainDumpOpen(true)}
            className="flex justify-center items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Do a Brain Dump
          </button>
        </div>

        <BrainDumpModal 
          isOpen={isBrainDumpOpen} 
          onClose={() => setIsBrainDumpOpen(false)} 
          onSuccess={fetchLoops}
        />

        <EditLoopModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={fetchLoops}
          loop={selectedLoop}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 relative">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your Desk</h1>
          <p className="text-slate-500 mt-2">What are you carrying right now?</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => { setSelectedLoop(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Loop
          </button>
          <button 
            onClick={() => setIsBrainDumpOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Brain Dump
          </button>
          <button 
            onClick={() => setIsCleanDeskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4" />
            Clean My Desk
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {/* Inbox Column */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 flex items-center justify-between">
            INBOX <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{inboxLoops.length}</span>
          </h2>
          <div className="space-y-3">
            {inboxLoops.length === 0 && <p className="text-xs text-slate-400 p-2 border border-dashed border-slate-200 rounded-lg text-center">Empty Inbox</p>}
            {inboxLoops.map(loop => (
              <div 
                key={loop._id} 
                onClick={() => { setSelectedLoop(loop); setIsEditModalOpen(true); }} 
                className="cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <LoopCard title={loop.title} type={loop.type} state="inbox" attention={loop.attention} deadline={loop.deadline} />
              </div>
            ))}
          </div>
        </section>

        {/* Active Column */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-blue-600 flex items-center justify-between">
            ACTIVE <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">{activeLoops.length}</span>
          </h2>
          <div className="space-y-3">
            {activeLoops.length === 0 && <p className="text-xs text-slate-400 p-2 border border-dashed border-slate-200 rounded-lg text-center">No active loops</p>}
            {activeLoops.map(loop => (
              <div 
                key={loop._id} 
                onClick={() => { setSelectedLoop(loop); setIsEditModalOpen(true); }} 
                className="cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <LoopCard title={loop.title} type={loop.type} state="active" attention={loop.attention} deadline={loop.deadline} />
              </div>
            ))}
          </div>
        </section>

        {/* Parked Column */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-stone-500 flex items-center justify-between">
            PARKED <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xs">{parkedLoops.length}</span>
          </h2>
          <div className="space-y-3">
            {parkedLoops.length === 0 && <p className="text-xs text-slate-400 p-2 border border-dashed border-slate-200 rounded-lg text-center">Nothing parked</p>}
            {parkedLoops.map(loop => (
              <div 
                key={loop._id} 
                onClick={() => { setSelectedLoop(loop); setIsEditModalOpen(true); }} 
                className="cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <LoopCard title={loop.title} type={loop.type} state="parked" attention={loop.attention} deadline={loop.deadline} />
              </div>
            ))}
          </div>
        </section>

        {/* Closed Column */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-emerald-600 flex items-center justify-between">
            CLOSED <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-xs">{closedLoops.length}</span>
          </h2>
          <div className="space-y-3">
            {closedLoops.length === 0 && <p className="text-xs text-slate-400 p-2 border border-dashed border-slate-200 rounded-lg text-center">Nothing closed yet</p>}
            {closedLoops.map(loop => (
              <div 
                key={loop._id} 
                onClick={() => { setSelectedLoop(loop); setIsEditModalOpen(true); }} 
                className="cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <LoopCard title={loop.title} type={loop.type} state="closed" attention={loop.attention} deadline={loop.deadline} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <BrainDumpModal 
        isOpen={isBrainDumpOpen} 
        onClose={() => setIsBrainDumpOpen(false)} 
        onSuccess={fetchLoops}
      />
      
      <CleanMyDeskModal 
        isOpen={isCleanDeskOpen} 
        onClose={() => setIsCleanDeskOpen(false)} 
        onSuccess={fetchLoops}
        loops={loops}
      />

      <EditLoopModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={fetchLoops}
        loop={selectedLoop}
      />
    </div>
  );
}