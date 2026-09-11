import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  Film,
  Compass,
  Utensils,
  TrendingUp,
  Shirt,
  Users2,
  CheckCircle2,
} from 'lucide-react';
import { DocumentPageLayout } from './DocumentPageLayout';

const EDITORIAL_PILLARS = [
  {
    title: 'Entertainment',
    description: 'Insightful cinema coverage, OTT releases, celebrity spotlights, and cultural commentary.',
    icon: Film,
  },
  {
    title: 'Women & Lifestyle',
    description: 'Inspiring personal narratives, modern womanhood, everyday living, and contemporary perspectives.',
    icon: Heart,
  },
  {
    title: 'Fashion & Style',
    description: 'Trend forecasts, timeless wardrobe curation, sustainable styling, and seasonal fashion guides.',
    icon: Shirt,
  },
  {
    title: 'Wellness & Health',
    description: 'Practical self-care, holistic health tips, mindful routines, and balanced lifestyle practices.',
    icon: Sparkles,
  },
  {
    title: 'Travel & Escapes',
    description: 'Immersive destination itineraries, hidden gems, mindful wanderlust, and travel planning.',
    icon: Compass,
  },
  {
    title: 'Food & Dining',
    description: 'Culinary traditions, easy modern recipes, regional gastronomy, and café culture.',
    icon: Utensils,
  },
  {
    title: 'Career & Finance',
    description: 'Smart money management, career development, financial literacy, and workplace growth.',
    icon: TrendingUp,
  },
  {
    title: 'Relationships',
    description: 'Thoughtful guidance on modern dating, family dynamics, friendships, and interpersonal connections.',
    icon: Users2,
  },
];

const EDITORIAL_VALUES = [
  {
    title: 'Editorial Authenticity',
    description: 'We believe in genuine storytelling that resonates with real people, free from sensationalism or clickbait.',
  },
  {
    title: 'Accuracy & Integrity',
    description: 'Every story is thoroughly researched and checked to ensure our readers receive trustworthy, well-informed perspectives.',
  },
  {
    title: 'Inclusivity & Empathy',
    description: 'We embrace diverse voices, lived experiences, and cultural backgrounds across every topic we explore.',
  },
  {
    title: 'Reader-First Commitment',
    description: 'Our audience comes first. We maintain strict independence between our editorial recommendations and commercial partnerships.',
  },
];

export function AboutUsDocument() {
  return (
    <DocumentPageLayout
      breadcrumbTitle="About Us"
      title="About Naya Andaaz"
      introSummary="Naya Andaaz is a contemporary digital publication celebrating modern living, thoughtful perspectives, and inspiring storytelling across culture, wellness, and lifestyle."
    >
      {/* 1. Who We Are */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Who We Are
        </h2>
        <p>
          Welcome to <strong className="text-stone-900 font-semibold">Naya Andaaz</strong>—a modern digital editorial platform created to inform, inspire, and empower today&apos;s curious, conscious readers. In an era of rapid information, we provide a refreshing editorial space where culture, lifestyle, and substantive storytelling converge.
        </p>
        <p>
          &ldquo;Naya Andaaz&rdquo; translates to a fresh perspective or new style—a philosophy that guides everything we publish. From deep dives into modern relationships and wellness practices to the latest cultural phenomena and practical career advice, our goal is to deliver stories that matter to you.
        </p>
      </section>

      {/* 2. Our Editorial Vision */}
      <section className="space-y-4 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Our Editorial Vision
        </h2>
        <p>
          We envision a digital media landscape where depth meets everyday accessibility. We strive to create content that adds real value to your life—whether that means learning a new perspective, finding balance through mindful wellness, or discovering a destination that sparks your curiosity.
        </p>
        <p>
          Our editors and contributors craft articles that are thoughtful, relatable, and grounded in the realities of modern life. We avoid superficial noise in favor of substance, practical utility, and authentic joy.
        </p>
      </section>

      {/* 3. What We Cover / Our Focus */}
      <section className="space-y-5 pt-6 border-t border-stone-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            What We Cover
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Our reporting and features span eight core pillars of modern life:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {EDITORIAL_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex items-start gap-3.5 p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition"
              >
                <div className="w-9 h-9 rounded-lg bg-pink-100 text-[#EC008C] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Editorial Values & Content Approach */}
      <section className="space-y-4 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Editorial Values &amp; Content Approach
        </h2>
        <p>
          Trust is the cornerstone of our bond with our audience. We adhere to clear principles to ensure our publication remains reliable, respectful, and enriching:
        </p>

        <div className="space-y-3 pt-2">
          {EDITORIAL_VALUES.map((val) => (
            <div key={val.title} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#EC008C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 font-semibold">{val.title}: </strong>
                <span className="text-stone-700">{val.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Audience & Community */}
      <section className="space-y-4 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Our Audience &amp; Community
        </h2>
        <p>
          Naya Andaaz is created for thinkers, dreamers, and doers. Our readers are forward-looking individuals who appreciate nuanced viewpoints, celebrate culture, value self-development, and seek balanced, positive inspiration in their daily routines.
        </p>
        <p>
          We encourage an active dialogue with our community. Whether you have a story suggestion, constructive critique, or an experience you want to share, we listen with an open mind.
        </p>
      </section>

      {/* 6. Editorial Independence */}
      <section className="space-y-4 pt-6 border-t border-stone-200/80">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Editorial Independence &amp; Transparency
        </h2>
        <p>
          We take editorial integrity seriously. Any sponsored content, brand partnerships, or commercial collaborations on Naya Andaaz are clearly disclosed to our audience. Our writers and editors maintain full creative discretion over editorial recommendations, reviews, and cultural commentary.
        </p>
      </section>
    </DocumentPageLayout>
  );
}
