import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS, INITIAL_CATEGORIES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const [categories, settings, primaryMenuItems] = await Promise.all([
    getCategories().catch(() => INITIAL_CATEGORIES),
    getSettings()
      .then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS))
      .catch(() => DEFAULT_SITE_SETTINGS),
    getPrimaryMenuItems().catch(() => []),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf8] text-stone-900 selection:bg-[#FCE7F3] selection:text-[#111111]">
      <Navbar
        categories={categories}
        settings={settings}
        primaryMenuItems={primaryMenuItems}
      />

      <main className="flex-1 pt-32 sm:pt-36 pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
