import React from 'react';
import { DocumentPageLayout } from './DocumentPageLayout';
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  Mail,
  Sparkles,
  Scale,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export function TermsDocument() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms & Agreement' },
    { id: 'about', title: '2. About Naya Andaaz & Services' },
    { id: 'use-of-site', title: '3. Permitted & Acceptable Use Policy' },
    { id: 'disclaimers', title: '4. Editorial & Content Disclaimers' },
    { id: 'intellectual-property', title: '5. Intellectual Property & Copyright' },
    { id: 'fair-use', title: '6. Fair Use & Social Sharing Guidelines' },
    { id: 'user-contributions', title: '7. User Contributions & Comments' },
    { id: 'advertising', title: '8. Advertising, Sponsored Content & Affiliates' },
    { id: 'third-party', title: '9. Third-Party Links & External Platforms' },
    { id: 'editorial-independence', title: '10. Editorial Independence & Corrections' },
    { id: 'dmca', title: '11. DMCA & Copyright Infringement Takedown' },
    { id: 'disclaimer-warranties', title: '12. Disclaimer of Warranties' },
    { id: 'limitation-liability', title: '13. Limitation of Liability' },
    { id: 'indemnification', title: '14. Indemnification' },
    { id: 'privacy-ref', title: '15. Privacy & Data Protection' },
    { id: 'modifications', title: '16. Changes & Amendments to Terms' },
    { id: 'governing-law', title: '17. Governing Law & Dispute Resolution' },
    { id: 'contact', title: '18. Grievance Redressal & Contact Desk' },
  ];

  return (
    <DocumentPageLayout
      breadcrumbTitle="Terms & Conditions"
      title="Terms & Conditions"
      lastUpdated="Last Updated: September 2026"
      introSummary="Welcome to Naya Andaaz. These Terms & Conditions govern your access to and use of our digital publication, website features, editorial content, and community interactions. Please read these terms carefully before accessing or using our platform."
      showContactBox={false}
    >
      {/* Quick Navigation / Table of Contents */}
      <nav aria-label="Table of contents" className="my-8 bg-stone-50 border border-stone-200/90 rounded-2xl p-5 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-[#EC008C]" />
          <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
            Quick Navigation &amp; Table of Contents
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="text-stone-600 hover:text-[#EC008C] hover:underline transition-colors py-0.5 truncate block"
            >
              {sec.title}
            </a>
          ))}
        </div>
      </nav>

      {/* 1. Acceptance of Terms */}
      <section id="acceptance" className="space-y-4 pt-4 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            01
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Acceptance of Terms &amp; Agreement
          </h2>
        </div>
        <p>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Visitor&rdquo;, or &ldquo;Reader&rdquo;) and Naya Andaaz (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of the Naya Andaaz digital publication accessible via{' '}
          <a href="https://www.nayaandaaz.com" className="text-[#EC008C] hover:underline font-semibold">
            www.nayaandaaz.com
          </a>{' '}
          and its associated subdomains, mobile views, newsletters, and interactive features.
        </p>
        <p>
          By visiting, browsing, or interacting with Naya Andaaz, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our{' '}
          <a href="/privacy-policy" className="text-[#EC008C] hover:underline font-medium">
            Privacy Policy
          </a>
          . If you do not agree to these Terms, you must discontinue your use of our platform immediately.
        </p>
      </section>

      {/* 2. About Naya Andaaz */}
      <section id="about" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            02
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            About Naya Andaaz &amp; Services
          </h2>
        </div>
        <p>
          Naya Andaaz is an independent contemporary digital publication dedicated to modern narratives, lifestyle insights, cultural commentary, wellness, entertainment, fashion, beauty, relationships, food, travel, and personal growth.
        </p>
        <p>
          Our platform delivers curated journalism, feature stories, trend analyses, editorial essays, and creative multimedia journalism intended solely for informational, cultural, and leisure enjoyment.
        </p>
      </section>

      {/* 3. Permitted & Acceptable Use Policy */}
      <section id="use-of-site" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            03
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Permitted &amp; Acceptable Use Policy
          </h2>
        </div>
        <p>
          You are granted a limited, personal, non-exclusive, non-transferable, and revocable license to access and read content on Naya Andaaz for your private, non-commercial purposes. As a condition of your use of the platform, you expressly agree that you will NOT:
        </p>
        <ul className="space-y-2.5 text-stone-700 pl-1">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Engage in automated scraping, data extraction, programmatic harvesting, or systematic crawling of our editorial narratives or images without prior written consent.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Bypass, circumvent, disable, or interfere with security features, paywalls, rate limiters, or digital rights management mechanisms.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Transmit any viruses, worms, malware, spyware, trojans, or harmful code that could harm our website, servers, or other visitors.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Use the website to post or transmit defamatory, abusive, threatening, obscene, discriminatory, or unlawful material.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Impersonate any journalist, editor, employee, contributor, or representative of Naya Andaaz.</span>
          </li>
        </ul>
      </section>

      {/* 4. Editorial & Content Disclaimers */}
      <section id="disclaimers" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            04
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Editorial &amp; Content Disclaimers
          </h2>
        </div>
        <p>
          All articles, guides, essays, recipes, reviews, and commentaries published on Naya Andaaz are created in good faith for general cultural, educational, lifestyle, and entertainment purposes.
        </p>

        {/* Highlight Box for Wellness, Health & Finance Disclaimer */}
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 sm:p-6 text-amber-950 space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-amber-900 text-base sm:text-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Important Advisory Notice on Health, Wellness &amp; Financial Content</span>
          </div>
          <p className="text-sm sm:text-[15px] leading-relaxed text-amber-900">
            Articles covering health, fitness, beauty regimes, holistic wellness, career advancement, investments, or personal finance represent journalistic perspectives and informative lifestyle commentary.
          </p>
          <p className="text-sm sm:text-[15px] leading-relaxed text-amber-900">
            <strong>Nothing published on Naya Andaaz constitutes professional medical, diagnostic, psychiatric, legal, or licensed financial advice.</strong> Always consult qualified physicians, healthcare practitioners, or certified advisors before undertaking any new dietary program, fitness regimen, beauty treatment, or financial decision.
          </p>
        </div>
      </section>

      {/* 5. Intellectual Property & Copyright */}
      <section id="intellectual-property" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            05
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Intellectual Property &amp; Copyright
          </h2>
        </div>
        <p>
          All materials and assets appearing on Naya Andaaz—including but not limited to written journalism, original photography, editorial graphics, visual compositions, illustrations, audio-visual clips, brand trademarks, logos, page layouts, and software code—are the exclusive intellectual property of Naya Andaaz or its licensed contributors and are protected under Indian and international copyright and trademark laws.
        </p>
        <p>
          Except where explicitly permitted by law or granted in writing by Naya Andaaz, you may not reproduce, copy, republish, syndicate, sell, license, broadcast, or create derivative works from any part of our publication.
        </p>
      </section>

      {/* 6. Fair Use & Social Sharing Guidelines */}
      <section id="fair-use" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            06
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Fair Use &amp; Social Sharing Guidelines
          </h2>
        </div>
        <p>
          We encourage readers to share stories and spark meaningful conversations. You are welcome to quote brief excerpts of our articles (up to 75 words) on personal blogs, social media platforms, or academic work, provided that:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li>You provide clear and prominent attribution to <strong>Naya Andaaz</strong> and the author.</li>
          <li>You include an active, direct hyperlink to the original article on <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded font-mono">www.nayaandaaz.com</code>.</li>
          <li>You do not modify the excerpt in any way that distorts its original meaning or context.</li>
        </ul>
      </section>

      {/* 7. User Contributions & Comments */}
      <section id="user-contributions" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            07
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            User Contributions &amp; Comments
          </h2>
        </div>
        <p>
          When you post comments, submit guest author pitches, or send feedback to our editorial desk, you represent and warrant that your submissions are your original work and do not infringe any third-party intellectual property or privacy rights.
        </p>
        <p>
          By submitting content to Naya Andaaz, you grant us an irrevocable, perpetual, royalty-free, worldwide, non-exclusive license to use, display, edit, and publish your contribution across our digital and social media channels.
        </p>
        <p>
          We reserve the right, in our sole discretion, to monitor, edit, refuse, or remove any reader comment or contribution that violates community standards or applicable law.
        </p>
      </section>

      {/* 8. Advertising, Sponsored Content & Affiliates */}
      <section id="advertising" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            08
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Advertising, Sponsored Content &amp; Affiliates
          </h2>
        </div>
        <p>
          To maintain an accessible, high-quality publication, Naya Andaaz may display programmatic advertisements, brand collaborations, and sponsored editorial stories.
        </p>
        <p>
          All sponsored narratives and commercial partnerships are conspicuously labeled with designations such as <em>&ldquo;Sponsored&rdquo;</em>, <em>&ldquo;Partner Story&rdquo;</em>, or <em>&ldquo;Brand Collaboration&rdquo;</em> in full compliance with advertising standards.
        </p>
        <p>
          Certain articles may include affiliate tracking links. If you purchase products or services through these links, Naya Andaaz may receive an affiliate commission at no additional cost to you. This does not influence our objective editorial evaluations.
        </p>
      </section>

      {/* 9. Third-Party Links & External Platforms */}
      <section id="third-party" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            09
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Third-Party Links &amp; External Platforms
          </h2>
        </div>
        <p>
          Our articles may contain hyperlinks to external third-party websites, social networks, retail merchants, or informational resources. Naya Andaaz does not operate, control, endorse, or assume legal liability for the content, privacy practices, terms of service, or products offered by external destinations.
        </p>
        <p>
          Accessing third-party websites is done entirely at your own risk. We encourage you to review the specific legal terms and privacy policies of any third-party destination you visit.
        </p>
      </section>

      {/* 10. Editorial Independence & Corrections */}
      <section id="editorial-independence" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            10
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Editorial Independence &amp; Corrections
          </h2>
        </div>
        <p>
          Naya Andaaz adheres to rigorous standards of journalistic authenticity, fair critique, and factual verification. Our editorial team exercises complete editorial independence from advertisers and commercial sponsors.
        </p>
        <p>
          In the event of a factual error, we are committed to promptly correcting verified inaccuracies with clear transparency. Readers who identify factual discrepancies are encouraged to notify our editorial desk at{' '}
          <a href="mailto:hello@nayaandaaz.com" className="text-[#EC008C] hover:underline font-medium">
            hello@nayaandaaz.com
          </a>
          .
        </p>
      </section>

      {/* 11. DMCA & Copyright Infringement Takedown */}
      <section id="dmca" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            11
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            DMCA &amp; Copyright Infringement Takedown
          </h2>
        </div>
        <p>
          Naya Andaaz respects the intellectual property rights of creators and content owners. If you believe in good faith that any content or photography appearing on our platform infringes your copyright, please submit a written notification containing:
        </p>
        <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-sm sm:text-base">
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Identification of the material that is claimed to be infringing, including the specific URL on Naya Andaaz.</li>
          <li>Your contact information (name, postal address, telephone number, and email address).</li>
          <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
          <li>An electronic or physical signature of the authorized copyright owner.</li>
        </ol>
        <p className="text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-xl p-4">
          Please submit all copyright notices to our designated legal desk:{' '}
          <a href="mailto:hello@nayaandaaz.com?subject=DMCA%20Copyright%20Notice" className="text-[#EC008C] font-semibold hover:underline">
            hello@nayaandaaz.com
          </a>{' '}
          with the subject line <em>&ldquo;DMCA Copyright Infringement Notice&rdquo;</em>.
        </p>
      </section>

      {/* 12. Disclaimer of Warranties */}
      <section id="disclaimer-warranties" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            12
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Disclaimer of Warranties
          </h2>
        </div>
        <p className="uppercase text-xs tracking-wider text-stone-500 font-semibold">
          Provided &ldquo;As Is&rdquo; and &ldquo;As Available&rdquo;
        </p>
        <p>
          The website, services, content, and materials provided on Naya Andaaz are made available on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express, implied, statutory, or otherwise.
        </p>
        <p>
          To the fullest extent permissible under applicable law, Naya Andaaz disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, title, and uninterrupted or error-free access. We do not warrant that our website will be secure or free from bugs, viruses, or interruptions.
        </p>
      </section>

      {/* 13. Limitation of Liability */}
      <section id="limitation-liability" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            13
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Limitation of Liability
          </h2>
        </div>
        <p>
          To the maximum extent permitted by applicable law, in no event shall Naya Andaaz, its founders, editors, journalists, writers, contributors, technical operators, or corporate affiliates be held liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising out of or in connection with:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700 text-sm sm:text-base">
          <li>Your access to, use of, or inability to access or use the website.</li>
          <li>Any errors, omissions, inaccuracies, or delays in published editorial content.</li>
          <li>Any decisions made or actions taken in reliance on editorial articles or opinions.</li>
          <li>Any unauthorized access to, alteration of, or breach of servers or transmissions.</li>
        </ul>
      </section>

      {/* 14. Indemnification */}
      <section id="indemnification" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            14
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Indemnification
          </h2>
        </div>
        <p>
          You agree to defend, indemnify, and hold harmless Naya Andaaz, its editors, directors, contributors, and technical partners from and against any and all claims, damages, liabilities, losses, costs, and expenses (including reasonable legal fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-stone-700 text-sm sm:text-base">
          <li>Your violation of any provision of these Terms &amp; Conditions.</li>
          <li>Your violation of any third-party right, including copyright, trademark, or privacy rights.</li>
          <li>Any content, comment, or contribution you submit that causes harm to a third party.</li>
        </ul>
      </section>

      {/* 15. Privacy & Data Protection */}
      <section id="privacy-ref" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            15
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Privacy &amp; Data Protection
          </h2>
        </div>
        <p>
          Your privacy is fundamental to our reader relationship. Our collection, processing, and protection of visitor information are detailed in our dedicated{' '}
          <a href="/privacy-policy" className="text-[#EC008C] hover:underline font-semibold">
            Privacy Policy
          </a>
          , which is incorporated into and forms an integral part of these Terms.
        </p>
      </section>

      {/* 16. Changes & Amendments */}
      <section id="modifications" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            16
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Changes &amp; Amendments to Terms
          </h2>
        </div>
        <p>
          We reserve the right to review, update, modify, or replace any portion of these Terms &amp; Conditions at our sole discretion at any time. When modifications are made, we will revise the &ldquo;Last Updated&rdquo; date at the top of this document.
        </p>
        <p>
          Your continued access to or use of Naya Andaaz following the posting of any revisions constitutes your express acceptance of the revised Terms. We recommend checking this page periodically to stay informed of our current terms.
        </p>
      </section>

      {/* 17. Governing Law & Dispute Resolution */}
      <section id="governing-law" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            17
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Governing Law &amp; Dispute Resolution
          </h2>
        </div>
        <p>
          These Terms &amp; Conditions and any disputes arising out of or related to your use of Naya Andaaz shall be governed by and construed in accordance with the substantive laws of India, without regard to principles of conflicts of law.
        </p>
        <p>
          Any legal action, suit, or proceeding arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts located in India.
        </p>
      </section>

      {/* 18. Grievance Redressal & Contact */}
      <section id="contact" className="space-y-4 pt-8 border-t border-stone-200/80 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-pink-50 text-[#EC008C] font-mono text-sm font-bold flex items-center justify-center shrink-0 border border-pink-100">
            18
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Grievance Redressal &amp; Contact Desk
          </h2>
        </div>
        <p>
          In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules and digital publishing standards, if you have any questions, feedback, or grievances regarding our Terms &amp; Conditions or published content, please reach out directly:
        </p>
        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-6 space-y-2 text-sm sm:text-base">
          <p className="font-semibold text-stone-900">Naya Andaaz Editorial &amp; Legal Desk</p>
          <p className="text-stone-700">
            <strong>Email:</strong>{' '}
            <a href="mailto:hello@nayaandaaz.com" className="text-[#EC008C] hover:underline font-medium">
              hello@nayaandaaz.com
            </a>
          </p>
          <p className="text-stone-700">
            <strong>Official Web Portal:</strong>{' '}
            <a href="https://www.nayaandaaz.com" className="text-[#EC008C] hover:underline font-medium">
              www.nayaandaaz.com
            </a>
          </p>
          <p className="text-stone-500 text-xs sm:text-sm pt-2">
            We aim to acknowledge all written grievances and inquiries within 48 business hours.
          </p>
        </div>
      </section>
    </DocumentPageLayout>
  );
}

