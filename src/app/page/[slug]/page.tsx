import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getCategories, getPageBySlug, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { resolveSiteName, resolveSiteUrl, resolveSiteDescription, generatePageJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import { formatCanonicalUrl } from '@/lib/sitemap-utils';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContentRenderer } from '@/components/public/PageContentRenderer';
import { AboutUsDocument } from '@/components/public/document/AboutUsDocument';
import { TermsDocument } from '@/components/public/document/TermsDocument';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSettings().then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS)).catch(() => DEFAULT_SITE_SETTINGS);
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  // 1. ABOUT US SEO
  if (slug === 'about-us' || slug === 'about') {
    const canonicalUrl = formatCanonicalUrl('/page/about-us', baseUrl);
    const customTitle = settings.aboutUs?.heroTitle?.trim();
    const seoTitle = customTitle
      ? `${customTitle} | ${siteName}`
      : `About ${siteName} – Our Stories, Values & Editorial Focus`;

    const contextualDesc =
      settings.aboutUs?.heroDescription?.trim() ||
      settings.aboutUs?.aboutSection?.description?.trim() ||
      `Learn about ${siteName}, our editorial focus and the stories we cover across entertainment, women and lifestyle, fashion, wellness, travel, food and more.`;

    return {
      title: { absolute: seoTitle },
      description: contextualDesc,
      openGraph: {
        type: 'website',
        siteName,
        title: seoTitle,
        description: contextualDesc,
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: contextualDesc,
      },
      alternates: { canonical: canonicalUrl },
    };
  }

  // 2. TERMS & CONDITIONS SEO
  if (slug === 'terms-and-conditions' || slug === 'terms' || slug === 'terms-of-service') {
    const canonicalUrl = formatCanonicalUrl('/page/terms-and-conditions', baseUrl);
    const seoTitle = `Terms & Conditions | ${siteName}`;
    const description = `Read the Terms & Conditions governing the use of the ${siteName} website, including content, intellectual property, advertising, links and website usage.`;

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
      alternates: { canonical: canonicalUrl },
    };
  }

  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: `Page Not Found | ${siteName}`,
    };
  }

  const canonicalUrl = formatCanonicalUrl(`/page/${slug}`, baseUrl);

  // Sanitize any legacy brand references
  const sanitize = (text?: string | null) => {
    if (!text) return '';
    return text
      .replace(/Sereia/gi, siteName)
      .replace(/[a-zA-Z0-9._%+-]+@sereia\.news/gi, 'hello@nayaandaaz.com')
      .replace(/https?:\/\/sereia\.news/gi, baseUrl)
      .trim();
  };

  const cleanTitle = sanitize(page.title);
  const cleanSeoTitle = sanitize(page.seoTitle);
  const cleanMetaDesc = sanitize(page.metaDescription);

  // Strict Title Priority:
  // 1. Page-specific SEO title
  // 2. Contextual page title
  // 3. Global fallback
  const displayTitle = cleanSeoTitle || `${cleanTitle} | ${siteName}`;
  const title = cleanSeoTitle ? { absolute: cleanSeoTitle } : cleanTitle;

  // Strict Description Priority:
  // 1. Page-specific SEO meta description
  // 2. Automatically generated contextual description
  // 3. Global default description as final fallback
  let contextualDesc = '';
  if (slug === 'contact-us') {
    contextualDesc = `Get in touch with ${siteName} editorial desk, partnerships, advertising, and press inquiries. Reach us at hello@nayaandaaz.com.`;
  } else if (page.content) {
    contextualDesc = page.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  }

  const fallbackDesc = resolveSiteDescription(settings);
  const description = cleanMetaDesc || contextualDesc || fallbackDesc;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName,
      title: displayTitle,
      description,
      url: canonicalUrl,
      images: page.featuredImage ? [{ url: page.featuredImage, alt: cleanTitle }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
      images: page.featuredImage ? [page.featuredImage] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function StaticCustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cleanSlug = (slug || '').toLowerCase().trim();

  if (cleanSlug === 'privacy-policy') {
    redirect('/privacy-policy');
  }

  if (cleanSlug === 'about') {
    permanentRedirect('/page/about-us');
  }

  if (
    cleanSlug === 'terms' ||
    cleanSlug === 'terms-of-service' ||
    cleanSlug === 'terms-conditions' ||
    cleanSlug === 'terms-and-condition'
  ) {
    permanentRedirect('/page/terms-and-conditions');
  }

  const [categories, settings, primaryMenuItems] = await Promise.all([
    getCategories().catch(() => []),
    getSettings().then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS)).catch(() => DEFAULT_SITE_SETTINGS),
    getPrimaryMenuItems().catch(() => []),
  ]);

  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  // 1. ABOUT US PAGE
  if (cleanSlug === 'about-us') {
    const aboutPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About ${siteName} – Our Stories, Values & Editorial Focus`,
      description: `Learn about ${siteName}, our editorial focus and the stories we cover across entertainment, women and lifestyle, fashion, wellness, travel, food and more.`,
      url: formatCanonicalUrl('/page/about-us', baseUrl),
      mainEntity: {
        '@type': 'NewsMediaOrganization',
        name: siteName,
        url: baseUrl,
        email: 'hello@nayaandaaz.com',
      },
    };

    const aboutBreadcrumbSchema = generateBreadcrumbJsonLd(
      [
        { name: 'Home', url: '/' },
        { name: 'About Us', url: '/page/about-us' },
      ],
      settings
    );

    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col justify-between">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aboutPageSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aboutBreadcrumbSchema),
          }}
        />
        <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />
        <AboutUsDocument />
        <Footer settings={settings} categories={categories} />
      </div>
    );
  }

  // 2. TERMS & CONDITIONS PAGE
  if (cleanSlug === 'terms-and-conditions') {
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

  // 3. GENERIC DYNAMIC PAGE (From Database)
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  if (page.slug.toLowerCase().includes('term') || page.title.toLowerCase().includes('term')) {
    permanentRedirect('/page/terms-and-conditions');
  }

  const sanitize = (text?: string | null) => {
    if (!text) return '';
    return text
      .replace(/Sereia/gi, siteName)
      .replace(/[a-zA-Z0-9._%+-]+@sereia\.news/gi, 'hello@nayaandaaz.com')
      .replace(/https?:\/\/sereia\.news/gi, baseUrl)
      .trim();
  };

  const cleanTitle = sanitize(page.title);
  const cleanContent = sanitize(page.content);

  const pageSchema = generatePageJsonLd({ ...page, title: cleanTitle, content: cleanContent }, settings);
  const breadcrumbSchema = generateBreadcrumbJsonLd(
    [
      { name: 'Home', url: '/' },
      { name: cleanTitle, url: `/page/${page.slug}` },
    ],
    settings
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-[#EC008C] mb-6 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <article className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 shadow-2xs space-y-6">
          <header className="border-b border-stone-200 pb-6">
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-950">
              {cleanTitle}
            </h1>
            <div className="text-xs text-stone-500 mt-2">
              Published on {new Date(page.publishedAt).toLocaleDateString()}
            </div>
          </header>

          {page.featuredImage && (
            <div className="rounded-xl overflow-hidden bg-stone-100 max-h-96">
              <img
                src={page.featuredImage}
                alt={cleanTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="max-w-none font-serif text-stone-800 leading-relaxed">
            <PageContentRenderer content={cleanContent} />
          </div>
        </article>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
