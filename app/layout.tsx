import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/app/context/AuthContext';
import { ChatProvider } from '@/app/context/ChatContext';

import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

const FloatingChatWrapper = dynamic(() => import('./components/chat/FloatingChatWrapper'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Turf - Find Your Perfect Sports Ground',
  description: 'Creating beautiful spaces that inspire and endure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ChatProvider>
            {children}

            <FloatingChatWrapper />

            <Toaster position="top-right" richColors />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}