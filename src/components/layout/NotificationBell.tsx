"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Zap } from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new alerts to simulate real-time for the demo
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">You're all caught up.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(notif => (
                  <div key={notif._id} className={`p-4 flex gap-3 ${notif.isRead ? 'opacity-60' : 'bg-indigo-50/30'}`}>
                    <div className={`mt-0.5 p-1.5 rounded-full h-fit ${notif.type === 'discovery' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {notif.type === 'discovery' ? <Zap className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}