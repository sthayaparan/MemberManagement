import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { ChatSidebar } from '@/components/ChatSidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Member Management - Professional Member Directory',
  description: 'Manage members with ease using our modern, professional member management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>
        <footer className="bg-gradient-to-r from-dark-navy via-slate-900 to-slate-800 text-white text-center py-6 mt-16 border-t border-slate-700">
          <p className="text-sm font-medium text-slate-300">© 2026 Member Management System. All rights reserved.</p>
        </footer>
        <ChatSidebar />
      </body>
    </html>
  );
}
