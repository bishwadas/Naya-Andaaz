import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { getCategoryUrl } from '@/lib/categories';
import { Category, SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings | null;
  categories: Category[];
}

export const Footer: React.FC<FooterProps> = ({ settings, categories }) => {
  const parentCategories = categories.filter((category) => !category.parentId).slice(0, 10);
  const socialLinks = [
    { href: settings?.facebookUrl, label: 'Facebook', icon: Facebook },
    { href: settings?.instagramUrl, label: 'Instagram', icon: Instagram },
    { href: settings?.twitterUrl, label: 'X / Twitter', icon: Twitter },
    { href: settings?.youtubeUrl, label: 'YouTube', icon: Youtube },
  ].filter((social): social is typeof social & { href: string } => Boolean(social.href));

  return (
    <footer className="bg-[#101827] text-[#9eabc0] border-t border-[#1f2b3d]">
      <div className="mx-auto max-w-[1200px] px-10 py-[72px] sm:px-12 lg:px-0">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(150px,.65fr)] md:gap-16 lg:gap-24">
          <div className="max-w-[550px]">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.siteName || 'Site logo'} className="h-auto max-h-12 w-auto max-w-[240px] object-contain object-left" />
            ) : (
              <div className="text-4xl font-black italic tracking-tight text-white">{settings?.siteTitle || settings?.siteName || 'SEREIA'}</div>
            )}
            <p className="mt-10 max-w-[550px] text-[18px] leading-[1.9] text-[#9eabc0]">
              {settings?.tagline || settings?.siteDescription || 'Global journalism, fearless investigations, and cultural dispatches from the front lines of discovery.'}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-8 flex items-center gap-7">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-[#9eabc0] transition hover:text-white">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[24px] font-bold leading-none text-white">Categories</h4>
            <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 text-[17px] leading-tight">
              {parentCategories.map((category) => (
                <li key={category.id}>
                  <Link href={getCategoryUrl(category, categories)} className="transition hover:text-white">{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-bold leading-none text-white">Legal</h4>
            <ul className="mt-8 space-y-5 text-[17px] leading-tight">
              <li><Link href="/page/about-us" className="transition hover:text-white">About Us</Link></li>
              <li><Link href="/page/terms-and-conditions" className="transition hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-[68px] border-t border-[#293548] pt-10 text-center text-[16px] text-[#9eabc0]">
          Copyright © {new Date().getFullYear()}{' '}
          <Link href="/" className="transition hover:text-white">
            {settings?.siteName || settings?.siteTitle || 'SEREIA'}
          </Link>
          , Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
