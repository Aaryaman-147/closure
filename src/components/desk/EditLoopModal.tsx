import { useState, useEffect } from 'react';
import { X, Save, Trash2, Activity, Info } from 'lucide-react';

interface EditLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  loop?: any;
}

export default function EditLoopModal({ isOpen, onClose, onSuccess, loop }: EditLoopModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('project');
  const [state, setLoopState] = useState('inbox');
  const [isSaving, setIsSaving] = useState(false);
  const [evidenceTrail, setEvidenceTrail] = useState<any[]>([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  useEffect(() => {
    if (loop) {
      setTitle(loop.title);
      setType(loop.type);
      setLoopState(loop.state);
      
      // Fetch the evidence trail (FR-09 & FR-18)
      const fetchEvidence = async () => {
        setIsLoadingEvidence(true);
        try {
          const res = await fetch(`/api/evidence?loopId=${loop._id}`);
          if (res.ok) {
            const data = await res.json();
            setEvidenceTrail(data.evidence);
          }
        } catch (error) {
          console.error("Failed to fetch evidence:", error);
        } finally {
          setIsLoadingEvidence(false);
        }
      };
      fetchEvidence();
    } else {
      setTitle('');
      setType('project');
      setLoopState('inbox');
      setEvidenceTrail([]);
    }
  }, [loop, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = loop ? `/api/loops/${loop._id}` : '/api/loops';
      const method = loop ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, state }),
      });

      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save loop:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!loop?._id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${loop.title}"?`);
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/loops/${loop._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to delete loop:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {loop ? 'Loop Details' : 'Create Loop'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="project">Project</option>
                  <option value="academic">Academic</option>
                  <option value="learning">Learning</option>
                  <option value="recurring">Recurring</option>
                  <option value="task">Task</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={state} 
                  onChange={(e) => setLoopState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="inbox">Inbox</option>
                  <option value="active">Active</option>
                  <option value="parked">Parked</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* FR-09 & FR-18: Evidence Trail UI */}
          {loop && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                Why does Closure know this?
              </h3>
              
              {isLoadingEvidence ? (
                <p className="text-xs text-slate-400">Loading evidence...</p>
              ) : evidenceTrail.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500 flex gap-2">
                  <Info className="w-4 h-4 shrink-0 text-slate-400" />
                  No AI inferences or signals connected to this loop yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {evidenceTrail.map((evidence, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-700 mb-1">
                        {evidence.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                          {evidence.type}
                        </span>
                        <span>Confidence: {Math.round(evidence.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50 shrink-0">
          {loop ? (
            <button type="button" onClick={handleDelete} disabled={isSaving} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50">
              <Trash2 className="w-5 h-5" />
            </button>
          ) : <div />}
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}