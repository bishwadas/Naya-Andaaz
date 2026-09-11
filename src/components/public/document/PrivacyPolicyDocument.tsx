import React from 'react';
import { DocumentPageLayout } from './DocumentPageLayout';

export function PrivacyPolicyDocument() {
  return (
    <DocumentPageLayout
      breadcrumbTitle="Privacy Policy"
      title="Privacy Policy"
      lastUpdated="Last Updated: September 2026"
      introSummary="Naya Andaaz is committed to respecting and protecting the privacy of our readers and visitors. This Privacy Policy outlines what information we collect, how it is used, and the measures we take to keep your information safe when you visit our website."
    >
      {/* 1. Introduction & Scope */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          1. Introduction &amp; Scope
        </h2>
        <p>
          This Privacy Policy applies to all visitors, readers, and registered contributors of Naya Andaaz (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) accessing our digital publication via{' '}
          <a href="https://www.nayaandaaz.com" className="text-[#EC008C] hover:underline font-medium">
            www.nayaandaaz.com
          </a>{' '}
          and related digital services.
        </p>
        <p>
          We operate as an informational and editorial platform. Our core objective is to deliver quality stories and cultural journalism, not to sell personal reader data. We process only the minimum information necessary to operate, improve, and secure our website.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          2. Information We Collect
        </h2>
        <p>
          We collect two general categories of information when you interact with Naya Andaaz:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li><strong>Information you provide directly</strong> (such as when submitting a comment, subscribing to a newsletter, or sending us an email).</li>
          <li><strong>Information collected automatically</strong> through cookies, server log files, and standard web technologies as you browse our articles.</li>
        </ul>
      </section>

      {/* 3. Information You Provide */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          3. Information You Provide to Us
        </h2>
        <p>
          You can read the vast majority of our editorial articles without registering an account or providing personal details. However, specific interactive features may require basic details:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li><strong>Email Newsletters:</strong> When you subscribe to our curated email digests, we store your email address to deliver our latest stories and updates.</li>
          <li><strong>Editorial Inquiries &amp; Feedback:</strong> If you contact our editorial desk via email or contact forms, we receive your name, email address, and message content to respond to your query.</li>
          <li><strong>Comments &amp; Contributions:</strong> When submitting article comments or author guest pitches, we collect your submitted name, email, and contribution text.</li>
        </ul>
      </section>

      {/* 4. Automatically Collected Information */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          4. Automatically Collected Information
        </h2>
        <p>
          Like most web publications, our servers automatically log standard technical data when your device requests a webpage. This may include:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li>Internet Protocol (IP) address (often truncated or anonymized by analytics tools)</li>
          <li>Browser type, version, and language preferences</li>
          <li>Operating system and device model</li>
          <li>Referring web page or search query that brought you to our site</li>
          <li>Pages viewed, time spent per article, and timestamp of the visit</li>
        </ul>
        <p>
          This technical data is used purely in the aggregate to monitor site stability, diagnose technical errors, and understand which topics resonate most with our readership.
        </p>
      </section>

      {/* 5. Cookies and Similar Technologies */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          5. Cookies and Similar Technologies
        </h2>
        <p>
          Cookies are small text files placed on your device by websites you visit. Naya Andaaz uses cookies for:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li><strong>Essential Functions:</strong> Enabling session navigation, security verification, and remembering your user preferences (such as text size or display modes).</li>
          <li><strong>Performance &amp; Analytics:</strong> Understanding aggregated reader engagement, popular categories, and page loading speed.</li>
          <li><strong>Advertising Preferences:</strong> Facilitating contextual or interest-based advertising through reputable advertising partners.</li>
        </ul>
        <p>
          You can adjust your browser settings to refuse or delete cookies at any time. Please note that disabling cookies may affect certain interactive features on our website.
        </p>
      </section>

      {/* 6. How We Use Information */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          6. How We Use Information
        </h2>
        <p>
          We utilize the information collected for legitimate editorial and platform operations, including:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li>Delivering, maintaining, and enhancing our website articles and layout.</li>
          <li>Sending requested editorial digests and newsletters (which you can unsubscribe from at any time).</li>
          <li>Responding promptly to reader correspondence, tips, and customer support inquiries.</li>
          <li>Protecting the security and integrity of our publication against cyber threats, spam, and malicious activity.</li>
          <li>Analyzing reading trends to guide future editorial coverage and topic development.</li>
        </ul>
      </section>

      {/* 7. Analytics */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          7. Analytics and Website Measurement
        </h2>
        <p>
          We may work with standard web analytics providers (such as Google Analytics) to assess readership statistics. These services utilize cookies to gather anonymous metrics regarding page visits, bounce rates, and traffic sources. The data generated helps us refine our content and ensure our website performs smoothly across different devices.
        </p>
      </section>

      {/* 8. Advertising */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          8. Advertising and Sponsored Content
        </h2>
        <p>
          Advertisements displayed on Naya Andaaz help support our independent editorial team and keep our journalism accessible for free. Third-party advertising partners may use cookies to serve ads based on your visits to our site and other destinations on the web.
        </p>
        <p>
          We do not share your private contact information with advertisers. Sponsored partnerships and native brand collaborations are always marked clearly to preserve complete transparency with our readers.
        </p>
      </section>

      {/* 9. Third-Party Services and Links */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          9. Third-Party Services and External Links
        </h2>
        <p>
          Our stories frequently reference or link to external articles, research studies, social media platforms, or external publications. We are not responsible for the privacy practices, content, or cookie policies of external websites. We encourage you to review the privacy policy of any third-party website you visit.
        </p>
      </section>

      {/* 10. Communications */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          10. Communications and Newsletters
        </h2>
        <p>
          When you subscribe to Naya Andaaz newsletters or updates, we will send periodic editorial roundups to your inbox. Every email contains an easily accessible &ldquo;Unsubscribe&rdquo; link. You may opt out of receiving editorial emails at any time, and your email address will promptly be removed from our mailing list.
        </p>
      </section>

      {/* 11. Data Security */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          11. Data Security and Safeguards
        </h2>
        <p>
          We implement commercially reasonable administrative, technical, and physical safeguards to protect information against unauthorized access, loss, alteration, or misuse. Our site utilizes HTTPS encryption to ensure secure transmission of web traffic. However, no method of transmission over the internet is completely infallible, and we cannot guarantee absolute security.
        </p>
      </section>

      {/* 12. Data Retention */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          12. Data Retention Practices
        </h2>
        <p>
          We retain personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, or enforce our agreements. Anonymized analytics records may be retained longer for historical trend analysis.
        </p>
      </section>

      {/* 13. Your Choices and Rights */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          13. Your Choices and Rights
        </h2>
        <p>
          You maintain control over your information when using Naya Andaaz:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-stone-700">
          <li><strong>Access &amp; Correction:</strong> You may request access to or correction of personal information you have directly submitted to us.</li>
          <li><strong>Opt-Out of Newsletters:</strong> Use the unsubscribe link at the footer of any email to stop receiving communications.</li>
          <li><strong>Cookie Management:</strong> Configure your web browser to disable or clear cookies.</li>
        </ul>
      </section>

      {/* 14. Children's Privacy */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          14. Children&apos;s Privacy
        </h2>
        <p>
          Naya Andaaz is an editorial publication designed for a general adult and young-adult audience. We do not knowingly collect or solicit personal information from children under the age of 13. If you believe that a child has provided us with personal information, please contact us so we can promptly delete it.
        </p>
      </section>

      {/* 15. International Visitors */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          15. International Visitors
        </h2>
        <p>
          Naya Andaaz is primarily operated and published from India. If you visit our website from outside India, please note that information may be processed in accordance with Indian regulations and applicable global standards.
        </p>
      </section>

      {/* 16. Policy Updates */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          16. Updates to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time to reflect operational changes, new regulatory standards, or platform improvements. When changes are published, the revised &ldquo;Last Updated&rdquo; date at the top of this page will be adjusted accordingly. We encourage readers to periodically check this page.
        </p>
      </section>

      {/* 17. Contact Us */}
      <section className="space-y-3 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          17. Contact Us &amp; Grievance Redressal
        </h2>
        <p>
          If you have questions, comments, or data privacy concerns regarding this Privacy Policy, please reach out to our team:
        </p>
        <p className="font-medium text-stone-900">
          Privacy Desk: <a href="mailto:hello@nayaandaaz.com" className="text-[#EC008C] hover:underline">hello@nayaandaaz.com</a>
          <br />
          Official Website: <a href="https://www.nayaandaaz.com" className="text-[#EC008C] hover:underline">www.nayaandaaz.com</a>
        </p>
      </section>
    </DocumentPageLayout>
  );
}
