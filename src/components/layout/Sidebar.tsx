import Link from 'next/link';
import { LayoutDashboard, CalendarDays, Activity, Link as LinkIcon, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Desk', href: '/', icon: LayoutDashboard },
    { name: 'Weekly Closure', href: '/weekly-closure', icon: CalendarDays },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'Sources', href: '/sources', icon: LinkIcon },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-50 border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Closure</h1>
        <p className="text-xs text-slate-500 mt-1">Close what you start.</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}