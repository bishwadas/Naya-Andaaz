import React from 'react';
import { Mail, Globe, Calendar } from 'lucide-react';
import { DocumentBreadcrumb } from './DocumentBreadcrumb';

interface DocumentPageLayoutProps {
  breadcrumbTitle: string;
  title: string;
  lastUpdated?: string;
  introSummary?: string;
  children: React.ReactNode;
  showContactBox?: boolean;
}

export function DocumentPageLayout({
  breadcrumbTitle,
  title,
  lastUpdated,
  introSummary,
  children,
  showContactBox = true,
}: DocumentPageLayoutProps) {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Breadcrumb Navigation */}
        <DocumentBreadcrumb items={[{ label: breadcrumbTitle }]} />

        {/* Document Header */}
        <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-stone-200">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {title}
          </h1>

          <div className="w-14 h-1 bg-[#EC008C] rounded-full mt-4 mb-4" />

          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 font-sans mb-4">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>{lastUpdated}</span>
            </div>
          )}

          {introSummary && (
            <p className="text-base sm:text-lg text-stone-700 font-sans leading-relaxed pt-2">
              {introSummary}
            </p>
          )}
        </header>

        {/* Document Body */}
        <main className="text-stone-800 font-sans leading-relaxed text-[16px] sm:text-[17px] space-y-8">
          {children}
        </main>

        {/* Editorial Contact & Inquiries Footer Box */}
        {showContactBox && (
          <aside className="mt-14 pt-8 border-t border-stone-200">
            <div className="bg-stone-50 rounded-2xl border border-stone-200/80 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-2">
                Get in Touch
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                For questions, editorial feedback, syndication, or inquiries regarding our website policies, our editorial desk is here to help.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="mailto:hello@nayaandaaz.com"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/70 hover:border-[#EC008C] transition group shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-50 text-[#EC008C] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-mono uppercase text-stone-400 font-medium">Email Desk</span>
                    <span className="text-sm font-semibold text-stone-900 group-hover:text-[#EC008C] transition truncate block">
                      hello@nayaandaaz.com
                    </span>
                  </div>
                </a>

                <a
                  href="https://www.nayaandaaz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/70 hover:border-[#EC008C] transition group shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-50 text-[#EC008C] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-mono uppercase text-stone-400 font-medium">Official Portal</span>
                    <span className="text-sm font-semibold text-stone-900 group-hover:text-[#EC008C] transition truncate block">
                      www.nayaandaaz.com
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
