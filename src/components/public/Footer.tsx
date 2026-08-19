import React from 'react';
import Link from 'next/link';
import { Category, SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings | null;
  categories: Category[];
}

export const Footer: React.FC<FooterProps> = ({ settings, categories }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="space-y-4 md:col-span-1">
          <div className="font-serif text-2xl font-black text-amber-300 tracking-wider">
            {settings?.siteTitle || 'SEREIA'}
          </div>
          <p className="text-sm text-stone-400 font-serif leading-relaxed">
            {settings?.tagline || settings?.siteDescription || 'Global journalism, fearless investigations, and cultural dispatches from the front lines of discovery.'}
          </p>
          <div className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Sereia Publishing Group. All rights reserved.
          </div>
        </div>

        <div>
          <h4 className="font-serif text-white font-bold mb-4 tracking-wider text-sm uppercase">Sections</h4>
          <ul className="space-y-2 text-sm">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/${cat.slug}`} className="hover:text-amber-300 transition">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-white font-bold mb-4 tracking-wider text-sm uppercase">Gazette</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/page/about" className="hover:text-amber-300 transition">About Us</Link></li>
            <li><Link href="/page/contact" className="hover:text-amber-300 transition">Contact & Tips</Link></li>
            <li><Link href="/page/editorial-guidelines" className="hover:text-amber-300 transition">Editorial Ethics</Link></li>
            <li><Link href="/page/privacy" className="hover:text-amber-300 transition">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-white font-bold mb-4 tracking-wider text-sm uppercase">Administration</h4>
          <p className="text-xs text-stone-400 mb-4">
            Secure enterprise CMS portal for editorial board members, editors, and contributing journalists.
          </p>
          <Link
            href="/admin"
            className="inline-block px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold rounded text-xs transition"
          >
            Admin CMS Login
          </Link>
        </div>
      </div>
    </footer>
  );
};
