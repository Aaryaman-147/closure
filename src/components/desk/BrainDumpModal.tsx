import { useState } from 'react';
import { X, Sparkles, ArrowRight, Check } from 'lucide-react';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Trigger a refresh of the Desk
}

export default function BrainDumpModal({ isOpen, onClose, onSuccess }: BrainDumpModalProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [candidates, setCandidates] = useState<{ title: string; type: string }[] | null>(null);

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setCandidates(data.candidates);
    } catch (error) {
      console.error("Failed to extract:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!candidates) return;
    setIsSaving(true);

    try {
      // Save all candidates to the database as 'inbox' loops
      await Promise.all(
        candidates.map((candidate) =>
          fetch('/api/loops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: candidate.title,
              type: candidate.type,
              state: 'inbox', 
            }),
          })
        )
      );
      
      onSuccess(); // Refresh the desk
      resetAndClose();
    } catch (error) {
      console.error("Failed to save loops:", error);
      setIsSaving(false);
    }
  };

  const resetAndClose = () => {
    setInput('');
    setCandidates(null);
    setIsProcessing(false);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Brain Dump
          </h2>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {!candidates ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                What are you currently trying to do?
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I'm working on a hackathon, studying bioprocess, practicing LeetCode..."
                className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-slate-700 text-sm placeholder:text-slate-400"
                disabled={isProcessing}
              />
              <button
                onClick={handleExtract}
                disabled={!input.trim() || isProcessing}
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Understanding your Desk...
                  </>
                ) : (
                  <>
                    Extract Loops
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm font-medium text-slate-700">
                Closure found {candidates.length} potential loops. Confirm to add them to your Inbox.
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {candidates.map((candidate, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-sm font-medium text-slate-900">{candidate.title}</span>
                    <span className="text-xs bg-white px-2 py-1 border border-slate-200 rounded-md capitalize text-slate-500">
                      {candidate.type}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm Candidates
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}