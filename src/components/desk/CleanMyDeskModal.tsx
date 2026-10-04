import { useState } from 'react';
import { X, Layers, Check, ArchiveRestore, Archive } from 'lucide-react';

interface CleanMyDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>; // Updated to accept an async function
  loops: any[]; // Accepts the loops from DeskPage
}

export default function CleanMyDeskModal({ isOpen, onClose, onSuccess, loops }: CleanMyDeskModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  
  // Track which suggestions the user actually wants to apply
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleCleanDesk = async () => {
    setIsProcessing(true);
    try {
      const activeLoops = loops.filter(l => l.state === 'active' || l.state === 'inbox');
      
      const res = await fetch('/api/ai/clean-desk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loops: activeLoops }),
      });
      
      const data = await res.json();
      
      // Safety check: Only proceed if suggestions actually exist
      if (data.suggestions && data.suggestions.park && data.suggestions.keepActive) {
        setSuggestions(data.suggestions);
        
        // Auto-select all suggestions by default
        const initialSelection = new Set<string>();
        data.suggestions.park.forEach((item: any) => initialSelection.add(`park-${item.id}`));
        data.suggestions.keepActive.forEach((item: any) => initialSelection.add(`keep-${item.id}`));
        setSelectedActions(initialSelection);
      } else {
        console.error("AI returned invalid data structure:", data);
        alert("The AI returned invalid formatting. Please try again.");
      }
      
    } catch (error) {
      console.error("Failed to analyze desk:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAction = (actionId: string) => {
    const newActions = new Set(selectedActions);
    if (newActions.has(actionId)) {
      newActions.delete(actionId);
    } else {
      newActions.add(actionId);
    }
    setSelectedActions(newActions);
  };

  const applyActions = async () => {
    setIsApplying(true);
    try {
      const updates = [];
      
      for (const parkItem of suggestions.park) {
        if (selectedActions.has(`park-${parkItem.id}`)) {
          updates.push(
            fetch(`/api/loops/${parkItem.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ state: 'parked' })
            })
          );
        }
      }
      
      await Promise.all(updates);
      onSuccess(); // Refresh the desk
      resetAndClose();
    } catch (error) {
      console.error("Failed to apply actions:", error);
      setIsApplying(false);
    }
  };

  const resetAndClose = () => {
    setIsProcessing(false);
    setIsApplying(false);
    setSuggestions(null);
    setSelectedActions(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Clean My Desk
          </h2>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!suggestions ? (
            <div className="text-center py-8">
              <Layers className={`w-12 h-12 mx-auto mb-4 ${isProcessing ? 'text-indigo-500 animate-pulse' : 'text-slate-300'}`} />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {isProcessing ? 'Looking through recent evidence...' : 'Let Closure evaluate your open loops'}
              </h3>
              <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
                {isProcessing 
                  ? 'Checking GitHub activity, deadlines, and recent browser signals.' 
                  : 'Closure will look for inactive projects and suggest what you can park or close to reduce your mental load.'}
              </p>
              
              <button
                onClick={handleCleanDesk}
                disabled={isProcessing || loops.filter(l => l.state === 'active' || l.state === 'inbox').length === 0}
                className="inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isProcessing ? 'Analyzing...' : 'Start Review'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm font-medium text-slate-700">
                Based on recent activity, here is what Closure suggests:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Park Suggestions */}
                <div className="border border-stone-200 bg-stone-50/50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-stone-600 mb-3 flex items-center gap-2">
                    <Archive className="w-3 h-3" /> SUGGESTED TO PARK
                  </h4>
                  <div className="space-y-2">
                    {suggestions.park.map((item: any) => (
                      <div key={`park-${item.id}`} className="flex items-center justify-between bg-white p-3 border border-stone-100 rounded-lg shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.reason}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={selectedActions.has(`park-${item.id}`)}
                          onChange={() => toggleAction(`park-${item.id}`)}
                          className="accent-stone-600 w-4 h-4" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keep Active Suggestions */}
                <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-blue-600 mb-3 flex items-center gap-2">
                    <ArchiveRestore className="w-3 h-3" /> KEEP ACTIVE
                  </h4>
                  <div className="space-y-2">
                    {suggestions.keepActive.map((item: any) => (
                      <div key={`keep-${item.id}`} className="flex justify-between items-center bg-white p-3 border border-blue-100 rounded-lg shadow-sm opacity-60">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.reason}</p>
                        </div>
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetAndClose}
                  className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyActions}
                  disabled={isApplying}
                  className="w-full flex justify-center items-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isApplying ? 'Applying...' : (
                    <>
                      <Check className="w-4 h-4" />
                      Apply Selected Actions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}