import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Share2,
  Send,
  MessageCircle,
  Video,
} from 'lucide-react';
import { getCategoryUrl } from '@/lib/categories';
import { Category, SiteSettings, SocialLinkItem } from '@/types';

interface FooterProps {
  settings: SiteSettings | null;
  categories: Category[];
}

// Custom crisp SVGs for Pinterest and X (Twitter)
const XTwitterIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PinterestIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

const ThreadsIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const TikTokIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.26-1.52 3.32-3.33.05-3.8.02-7.61.03-11.41.01-2.42 0-4.84.01-7.26z" />
  </svg>
);

const renderSocialIcon = (platform: string, className: string = 'w-5 h-5') => {
  const norm = (platform || '').toLowerCase().trim();
  switch (norm) {
    case 'facebook':
    case 'fb':
      return <Facebook className={className} strokeWidth={1.75} />;
    case 'instagram':
    case 'insta':
    case 'ig':
      return <Instagram className={className} strokeWidth={1.75} />;
    case 'twitter':
    case 'x':
    case 'twitter/x':
    case 'x/twitter':
      return <XTwitterIcon className={className} />;
    case 'youtube':
    case 'yt':
      return <Youtube className={className} strokeWidth={1.75} />;
    case 'pinterest':
    case 'pin':
      return <PinterestIcon className={className} />;
    case 'linkedin':
    case 'li':
      return <Linkedin className={className} strokeWidth={1.75} />;
    case 'tiktok':
      return <TikTokIcon className={className} />;
    case 'threads':
      return <ThreadsIcon className={className} />;
    case 'telegram':
      return <Send className={className} strokeWidth={1.75} />;
    case 'whatsapp':
      return <MessageCircle className={className} strokeWidth={1.75} />;
    default:
      return <Globe className={className} strokeWidth={1.75} />;
  }
};

export const Footer: React.FC<FooterProps> = ({ settings, categories = [] }) => {
  const parentCategories = categories.filter((category) => !category.parentId).slice(0, 10);

  // Determine custom logo (footer specific logo preferred, then primary logo)
  const customLogo =
    settings?.footer_logo_url ||
    settings?.logoFooter ||
    settings?.logoPrimary ||
    settings?.logo ||
    settings?.logo_url;

  // Resolve dynamic social links with fallback to legacy individual fields
  const activeSocialLinks: SocialLinkItem[] = React.useMemo(() => {
    if (settings?.socialLinks && Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0) {
      return settings.socialLinks
        .filter((item) => item.isEnabled !== false && Boolean(item.url?.trim()))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    const legacyList: SocialLinkItem[] = [];
    if (settings?.facebookUrl) {
      legacyList.push({ id: 'fb', platform: 'facebook', label: 'Facebook', url: settings.facebookUrl, isEnabled: true, order: 0 });
    }
    if (settings?.instagramUrl) {
      legacyList.push({ id: 'ig', platform: 'instagram', label: 'Instagram', url: settings.instagramUrl, isEnabled: true, order: 1 });
    }
    if (settings?.twitterUrl) {
      legacyList.push({ id: 'tw', platform: 'twitter', label: 'X (Twitter)', url: settings.twitterUrl, isEnabled: true, order: 2 });
    }
    if (settings?.youtubeUrl) {
      legacyList.push({ id: 'yt', platform: 'youtube', label: 'YouTube', url: settings.youtubeUrl, isEnabled: true, order: 3 });
    }
    if (settings?.pinterestUrl) {
      legacyList.push({ id: 'pin', platform: 'pinterest', label: 'Pinterest', url: settings.pinterestUrl, isEnabled: true, order: 4 });
    }
    if (settings?.linkedinUrl) {
      legacyList.push({ id: 'li', platform: 'linkedin', label: 'LinkedIn', url: settings.linkedinUrl, isEnabled: true, order: 5 });
    }
    return legacyList;
  }, [settings]);

  // Site description / tagline
  const siteDescription =
    settings?.siteDescription ||
    settings?.tagline ||
    'Explore the world of womens lifestyle with Naya Andaaz. Get your daily dose of wellness, style, beauty, fashion, and discussions on womens issues.';

  return (
    <footer className="bg-[#101827] text-[#94a3b8] border-t border-[#1e293b]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10 lg:gap-16">
          {/* LEFT COLUMN: BRANDING, DESCRIPTION & SOCIAL LINKS */}
          <div className="md:col-span-6 lg:col-span-5 max-w-[500px]">
            {/* Logo or Dynamic Site Title Fallback */}
            {customLogo ? (
              <Link href="/" className="inline-block transition-opacity hover:opacity-90" aria-label="Home">
                <img
                  src={customLogo}
                  alt={settings?.siteName || settings?.siteTitle || 'Naya Andaaz'}
                  width={280}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="h-auto max-h-12 sm:max-h-14 w-auto max-w-[240px] sm:max-w-[280px] object-contain object-left block"
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-block text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif hover:text-pink-400 transition-colors"
              >
                {settings?.siteTitle || settings?.siteName || 'NAYA ANDAAZ'}
              </Link>
            )}

            {/* Dynamic Site Description */}
            <p className="mt-6 text-[#94a3b8] text-[15px] sm:text-base leading-relaxed font-sans">
              {siteDescription}
            </p>

            {/* Dynamic Social Media Icons */}
            {activeSocialLinks.length > 0 && (
              <div className="mt-7 flex items-center gap-5 sm:gap-6 flex-wrap">
                {activeSocialLinks.map((link) => (
                  <a
                    key={link.id || `${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || link.platform}
                    title={link.label || link.platform}
                    className="text-[#94a3b8] hover:text-white transition-colors duration-200 inline-flex items-center justify-center"
                  >
                    {renderSocialIcon(link.platform, 'w-5 h-5 sm:w-6 sm:h-6')}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* MIDDLE COLUMN: CATEGORIES */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="text-xl sm:text-[22px] font-bold leading-none text-white font-sans tracking-tight">
              Categories
            </h4>
            <ul className="mt-7 grid grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3.5 sm:gap-y-4 text-[14px] sm:text-[15px] leading-tight">
              {parentCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={getCategoryUrl(category, categories)}
                    className="text-[#94a3b8] hover:text-white transition-colors block uppercase font-medium tracking-wide"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT COLUMN: LEGAL & STATIC LINKS */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-xl sm:text-[22px] font-bold leading-none text-white font-sans tracking-tight">
              Legal
            </h4>
            <ul className="mt-7 space-y-3.5 sm:space-y-4 text-[14px] sm:text-[15px] leading-tight">
              <li>
                <Link href="/page/about-us" className="text-[#94a3b8] hover:text-white transition-colors block font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/page/terms-and-conditions" className="text-[#94a3b8] hover:text-white transition-colors block font-medium">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-[#94a3b8] hover:text-white transition-colors block font-medium">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT BOTTOM BAR */}
        <div className="mt-14 sm:mt-16 border-t border-[#1e293b] pt-8 text-center text-xs sm:text-sm text-[#94a3b8]">
          {settings?.copyrightText ? (
            <span>{settings.copyrightText}</span>
          ) : (
            <span>
              Copyright © {new Date().getFullYear()}{' '}
              <Link href="/" className="hover:text-white transition-colors">
                {settings?.siteName || settings?.siteTitle || 'Naya Andaaz'}
              </Link>
              , Inc. All rights reserved.
            </span>
          )}
        </div>
      </div>
    </footer>
  );
};
