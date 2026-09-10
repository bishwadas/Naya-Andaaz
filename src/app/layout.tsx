import React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from '@/lib/auth-client';
import { getSettings } from '@/db/repository';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import {
  resolveSiteUrl,
  resolveSiteName,
  resolveSiteDescription,
  resolveSiteTitle,
  resolveFaviconUrl,
  generateOrganizationJsonLd,
} from '@/lib/seo';
import '@/index.css';

const mukta = localFont({
  src: [
    {
      path: '../fonts/mukta/mukta-latin-200-normal.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../fonts/mukta/mukta-latin-300-normal.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/mukta/mukta-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/mukta/mukta-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/mukta/mukta-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/mukta/mukta-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/mukta/mukta-latin-800-normal.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-mukta',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const siteName = resolveSiteName(settings);
  const siteDesc = resolveSiteDescription(settings);
  const siteTitle = resolveSiteTitle(settings);
  const baseUrl = resolveSiteUrl(settings);
  const favicon = resolveFaviconUrl(settings);
  const ogImage = settings?.defaultOgImage;
  const verificationCode = settings?.searchConsoleVerification || 'googlea42932e85653f824';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: `%s | ${siteName}`,
    },
    description: siteDesc,
    applicationName: siteName,
    icons: {
      icon: [
        { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
        { url: favicon, type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: settings?.logo || settings?.logoPrimary || favicon },
      ],
    },
    verification: {
      google: verificationCode,
    },
    openGraph: {
      type: 'website',
      siteName: siteName,
      title: siteTitle,
      description: siteDesc,
      url: baseUrl,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: siteName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDesc,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const organizationSchema = generateOrganizationJsonLd(settings);

  return (
    <html lang="en" suppressHydrationWarning className={`h-full bg-[#fbfaf8] text-[#1c1917] antialiased ${mukta.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="min-h-full font-sans text-stone-900 flex flex-col">
        <NextTopLoader
          color="#db2777"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2.5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #db2777,0 0 5px #db2777"
          zIndex={99999}
          showAtBottom={false}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

