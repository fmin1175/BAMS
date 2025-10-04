'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isHomePage && <Navigation />}
      <main className={!isHomePage ? "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24" : ""}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}