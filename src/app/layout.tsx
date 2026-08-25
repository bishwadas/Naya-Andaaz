import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-client';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Sereia | The Definitive Journal of Contemporary Culture & Luxury',
  description: 'An authoritative editorial chronicling haute couture, architecture, contemporary arts, and elevated living.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Sereia Editorial Gazette',
    description: 'The Definitive Journal of Contemporary Culture, Haute Horlogerie & Design',
    type: 'website',
    url: 'https://sereia.news',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full bg-[#fbfaf8] text-[#1c1917] antialiased">
      <body className="min-h-full font-sans text-stone-900 flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
