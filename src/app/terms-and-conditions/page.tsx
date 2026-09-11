import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { resolveSiteName, resolveSiteUrl, generateBreadcrumbJsonLd } from '@/lib/seo';
import { formatCanonicalUrl } from '@/lib/sitemap-utils';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { TermsDocument } from '@/components/public/document/TermsDocument';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  const seoTitle = `Terms & Conditions | ${siteName}`;
  const description = `Read the Terms & Conditions governing the use of the ${siteName} website, including content, intellectual property, advertising, links and website usage.`;
  const canonicalUrl = formatCanonicalUrl('/page/terms-and-conditions', baseUrl);

  return {
    title: { absolute: seoTitle },
    description,
    openGraph: {
      type: 'website',
      siteName,
      title: seoTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: seoTitle,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function TermsAndConditionsPage() {
  const [categories, settings, primaryMenuItems] = await Promise.all([
    getCategories().catch(() => []),
    getSettings().then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS)).catch(() => DEFAULT_SITE_SETTINGS),
    getPrimaryMenuItems().catch(() => []),
  ]);

  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  const termsPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Terms & Conditions | ${siteName}`,
    description: `Read the Terms & Conditions governing the use of the ${siteName} website, including content, intellectual property, advertising, links and website usage.`,
    url: formatCanonicalUrl('/page/terms-and-conditions', baseUrl),
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: baseUrl,
    },
  };

  const termsBreadcrumbSchema = generateBreadcrumbJsonLd(
    [
      { name: 'Home', url: '/' },
      { name: 'Terms & Conditions', url: '/page/terms-and-conditions' },
    ],
    settings
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(termsPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(termsBreadcrumbSchema),
        }}
      />
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />
      <TermsDocument />
      <Footer settings={settings} categories={categories} />
    </div>
  );
}
