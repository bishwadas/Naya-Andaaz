import React from 'react';
import Link from 'next/link';
import {
  User,
  BarChart3,
  ShieldCheck,
  Share2,
  Lock,
  Mail,
  FileText,
  Edit3,
  PhoneCall,
  Globe,
  Shield,
  Key,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { getCategories, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import { DEFAULT_PRIVACY_POLICY_CONFIG } from '@/lib/constants';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

export const dynamic = 'force-dynamic';

function getIconComponent(iconName: string) {
  const props = { className: "w-5 h-5 text-pink-600" };
  switch (iconName) {
    case 'User': return <User {...props} />;
    case 'BarChart3': return <BarChart3 {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'Share2': return <Share2 {...props} />;
    case 'Lock': return <Lock {...props} />;
    case 'Mail': return <Mail {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'Edit3': return <Edit3 {...props} />;
    case 'PhoneCall': return <PhoneCall {...props} />;
    case 'Globe': return <Globe {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'Key': return <Key {...props} />;
    default: return <Shield {...props} />;
  }
}

export default async function PrivacyPolicyPage() {
  let config = DEFAULT_PRIVACY_POLICY_CONFIG;
  let categories: any[] = [];
  let settings: SiteSettings | undefined = undefined;
  let primaryMenuItems: any[] = [];

  try {
    const [fetchedSettings, fetchedCategories, fetchedMenuItems] = await Promise.all([
      getSettings().catch(() => null),
      getCategories().catch(() => []),
      getPrimaryMenuItems().catch(() => []),
    ]);
    if (fetchedSettings && (fetchedSettings as any).privacy_policy_page) {
      config = (fetchedSettings as any).privacy_policy_page;
    }
    settings = fetchedSettings as unknown as SiteSettings;
    categories = fetchedCategories || [];
    primaryMenuItems = fetchedMenuItems || [];
  } catch (err) {
    console.error('Failed to load privacy policy settings:', err);
  }

  const sections = config.sections || [];
  const contact = config.contact || {
    number: '9',
    icon: 'PhoneCall',
    heading: 'Contact Us',
    description: 'If you have any questions about this Privacy Policy, please contact us at:',
    email: 'social.bishwa@gmail.com',
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      <div>
        <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

        <div className="bg-white border-b border-stone-200 py-3 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs text-stone-500 font-mono uppercase tracking-wider">
              <Link href="/" className="hover:text-pink-600 transition">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-900 font-semibold">Privacy Policy</span>
            </nav>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-pink-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Magazine
            </Link>
          </div>
        </div>

        {/* Main Content Container */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-16 space-y-12">
          {/* Page Header */}
          <div className="space-y-4 border-l-4 border-pink-600 pl-4 sm:pl-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">
              {config.title || 'Privacy Policy'}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 max-w-3xl font-sans leading-relaxed">
              {config.intro}
            </p>
          </div>

          {/* Two-Column Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-4">
            {sections.map((sec: any, index: number) => {
              return (
                <div
                  key={sec.id || index}
                  className="flex items-start gap-4 pb-8 border-b border-stone-200/80 last:border-b-0 md:border-b-0 md:pb-0"
                >
                  <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    {getIconComponent(sec.icon)}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                      <span className="text-pink-600 font-mono text-sm font-semibold">{sec.number || index + 1}.</span>
                      {sec.heading}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {sec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Us Final Row / Box */}
          <div className="pt-8 border-t border-stone-200">
            <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  {getIconComponent(contact.icon || 'PhoneCall')}
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                    <span className="text-pink-600 font-mono text-sm font-semibold">{contact.number || '9'}.</span>
                    {contact.heading || 'Contact Us'}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {contact.description || 'If you have any questions about this Privacy Policy, please contact us at:'}
                  </p>
                </div>
              </div>

              <a
                href={`mailto:${contact.email || 'hello@sereia.com'}`}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center gap-2 shrink-0"
              >
                <Mail className="w-4 h-4" />
                {contact.email || 'hello@sereia.com'}
              </a>
            </div>
          </div>
        </main>
      </div>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
