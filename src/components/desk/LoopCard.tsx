import { Clock, AlertCircle } from 'lucide-react';

interface LoopCardProps {
  title: string;
  type: string;
  state: 'inbox' | 'active' | 'parked' | 'closed';
  attention?: 'high' | 'medium' | 'low';
  deadline?: string;
}

export default function LoopCard({ title, type, state, attention, deadline }: LoopCardProps) {
  // Map PRD status colors to Tailwind utility classes
  const stateColors = {
    inbox: 'border-slate-200 bg-slate-50',
    active: 'border-blue-200 bg-blue-50/50',
    parked: 'border-stone-200 bg-stone-50/50',
    closed: 'border-emerald-200 bg-emerald-50/50',
  };

  return (
    <div className={`p-4 rounded-xl border ${stateColors[state]} transition-all hover:shadow-sm group cursor-pointer`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-slate-900 leading-tight">{title}</h3>
        {attention === 'high' && (
          <AlertCircle className="w-4 h-4 text-amber-500" />
        )}
      </div>
      
      <div className="flex items-center gap-3 mt-4 text-xs font-medium text-slate-500">
        <span className="bg-white px-2 py-1 rounded-md border border-slate-200/60 shadow-sm capitalize">
          {type}
        </span>
        
        {deadline && (
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            {deadline}
          </span>
        )}
      </div>
    </div>
  );
}