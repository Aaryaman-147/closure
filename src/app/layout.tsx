import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import NotificationBell from '@/components/layout/NotificationBell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Closure | Close what you start',
  description: 'An AI-assisted personal workspace for open loops.',
  icons: {
    icon: '/icon.svg', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white flex min-h-screen`}>
        <Sidebar />
        
        {/* Floating Notification Bell in the top right */}
        <div className="fixed top-6 right-8 z-50">
          <NotificationBell />
        </div>

        <main className="flex-1 ml-64 min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}