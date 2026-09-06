import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { resolveSiteName, resolveSiteUrl, generatePageJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import { formatCanonicalUrl } from '@/lib/sitemap-utils';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PrivacyPolicyDocument } from '@/components/public/document/PrivacyPolicyDocument';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  // User-specified recommended SEO title and description for Privacy Policy:
  const pageTitle = `Privacy Policy | ${siteName}`;
  const customDesc = (settings as any)?.privacy_policy_page?.intro;
  const description =
    customDesc?.trim() ||
    `Learn how ${siteName} handles information, cookies, analytics, advertising and other data-related practices when you use our website.`;

  const canonicalUrl = formatCanonicalUrl('/privacy-policy', baseUrl);

  return {
    title: {
      absolute: pageTitle,
    },
    description,
    openGraph: {
      type: 'website',
      siteName,
      title: pageTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PrivacyPolicyPage() {
  let categories: any[] = [];
  let settings: SiteSettings | undefined = undefined;
  let primaryMenuItems: any[] = [];

  try {
    const [fetchedSettings, fetchedCategories, fetchedMenuItems] = await Promise.all([
      getSettings().catch(() => null),
      getCategories().catch(() => []),
      getPrimaryMenuItems().catch(() => []),
    ]);
    settings = (fetchedSettings as unknown as SiteSettings) || undefined;
    categories = fetchedCategories || [];
    primaryMenuItems = fetchedMenuItems || [];
  } catch (err) {
    console.error('Failed to load privacy policy data:', err);
  }

  const siteName = resolveSiteName(settings);
  const privacyPageSchema = generatePageJsonLd(
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      metaDescription: `Learn how ${siteName} handles information, cookies, analytics, advertising and other data-related practices when you use our website.`,
    },
    settings
  );

  const privacyBreadcrumbSchema = generateBreadcrumbJsonLd(
    [
      { name: 'Home', url: '/' },
      { name: 'Privacy Policy', url: '/privacy-policy' },
    ],
    settings
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyBreadcrumbSchema),
        }}
      />
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      <PrivacyPolicyDocument />

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
