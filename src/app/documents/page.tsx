"use client";

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2 } from 'lucide-react';

export default function DocumentsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loops, setLoops] = useState<any[]>([]);
  const [selectedLoop, setSelectedLoop] = useState('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents and active loops on mount
  useEffect(() => {
    fetch('/api/documents').then(res => res.json()).then(data => {
      if (data.documents) setDocuments(data.documents);
    });
    fetch('/api/loops').then(res => res.json()).then(data => {
      if (data.loops) setLoops(data.loops.filter((l: any) => l.state === 'active' || l.state === 'inbox'));
    });
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('loopId', selectedLoop);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        // Prepend the new document to the list instantly
        setDocuments(prev => [data.document, ...prev]);
        setSelectedLoop('none'); // Reset dropdown
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(doc => doc._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Documents</h1>
        <p className="text-slate-500 mt-2">Upload project briefs, syllabi, or rules for Closure to understand.</p>
      </header>

      {/* Upload Settings */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Associate with a Loop (Optional)</label>
        <select 
          value={selectedLoop}
          onChange={(e) => setSelectedLoop(e.target.value)}
          className="w-full md:w-1/2 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none"
        >
          <option value="none">-- No association --</option>
          {loops.map(loop => (
            <option key={loop._id} value={loop._id}>{loop.title}</option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer mb-12 
          ${isUploading ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
      >
        <UploadCloud className={`w-10 h-10 mx-auto mb-4 ${isUploading ? 'text-indigo-400 animate-bounce' : 'text-indigo-500'}`} />
        <h3 className="text-sm font-medium text-slate-900 mb-1">
          {isUploading ? 'Parsing document...' : 'Click to upload or drag and drop'}
        </h3>
        <p className="text-xs text-slate-500">PDF, TXT, or MD (max. 10MB)</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".pdf,.txt,.md" 
          className="hidden" 
        />
      </div>

      {/* Processed Documents List */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-4">PROCESSED DOCUMENTS</h2>
        
        {documents.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-500 text-sm bg-white">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm truncate max-w-[250px] sm:max-w-sm">{doc.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.extractedFacts} 
                      {doc.relatedLoopId && ` • Associated with "${doc.relatedLoopId.title}"`}
                    </p>
                  </div>
                </div>
                <button 
    onClick={() => handleDeleteDocument(doc._id)}
    className="text-slate-400 hover:text-red-500 transition-colors p-2"
  >
    <Trash2 className="w-4 h-4" />
  </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}