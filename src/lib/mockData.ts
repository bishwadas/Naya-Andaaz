import { ActivityLog, MediaItem, Page, Post } from '../types';
import { INITIAL_CATEGORIES, INITIAL_TAGS, INITIAL_USERS } from './constants';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_01',
    title: 'The Renaissance of Haute Couture: Inside the Atelier Secrets of Paris Fashion Week',
    slug: 'renaissance-haute-couture-paris-fashion-week',
    excerpt: 'An intimate journey through the hand-stitched embroidery, structural drapery, and architectural silhouettes defining the new era of Parisian luxury.',
    content: `
<h2>A Return to Sacred Craftsmanship</h2>
<p>Behind the gilded doors of Parisian salons on Rue Cambon and Avenue Montaigne, a quiet yet profound revolution is taking shape. While the digital landscape accelerates trends at an unprecedented velocity, the grand couture houses are deliberately slowing down, reaffirming the irreplaceable majesty of the human hand.</p>

<p>This season, master artisans have spent upwards of 1,200 hours on individual garments, utilizing antique tambour beading techniques alongside revolutionary laser-cut organza lattices. The result is a luminous synthesis of historical grandeur and futuristic dynamism.</p>

<figure class="my-8">
  <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" alt="Paris Haute Couture Atelier" class="w-full rounded-lg shadow-md" />
  <figcaption class="text-xs text-stone-500 mt-2 text-center italic">Inside the historic Paris atelier where each embroidery bead is placed by hand.</figcaption>
</figure>

<h3>Structural Silhouettes & Ethereal Textures</h3>
<p>Draped silks, structured corsetry sculpted with featherlight titanium boning, and cascading tulle capes commanded the runways. Designers seamlessly wove archival nods to 1950s ballgowns with hyper-modern asymmetrical necklines and sustainable botanical dyes.</p>

<blockquote>
  "Couture is not merely fashion; it is living sculpture that captures the emotional zeitgeist of our civilization."
  <cite>— Elena Rostova, Naya Andaaz Editorial Director</cite>
</blockquote>

<p>As collectors and cultural critics gather, one truth resonates clearly: true luxury is not about ubiquity, but about the timeless dedication to perfection that only human imagination can bestow.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Paris Haute Couture runway presentation showcasing structural silk artistry.',
    authorId: INITIAL_USERS[0].id,
    author: {
      id: INITIAL_USERS[0].id,
      name: INITIAL_USERS[0].name,
      username: INITIAL_USERS[0].username,
      avatar: INITIAL_USERS[0].avatar,
      bio: INITIAL_USERS[0].bio,
    },
    categoryId: 'cat_lifestyle',
    category: {
      id: 'cat_lifestyle',
      name: 'Women Lifestyle',
      slug: 'women-lifestyle',
      color: '#8B5CF6',
    },
    subCategoryId: 'cat_style',
    subCategory: {
      id: 'cat_style',
      name: 'Style & Fashion',
      slug: 'style',
    },
    tagIds: ['tag_1', 'tag_2'],
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[1]],
    status: 'published',
    isFeatured: true,
    isTrending: true,
    isEditorPick: true,
    views: 18450,
    likes: 842,
    readingTime: 5,
    publishedAt: '2026-08-12T10:00:00Z',
    updatedAt: '2026-08-12T10:00:00Z',
    createdAt: '2026-08-12T09:00:00Z',
    seoTitle: 'Paris Haute Couture Week: Atelier Secrets & Trends | Naya Andaaz',
    metaDescription: 'Explore the master craftsmanship, structural silhouettes, and timeless couture highlights from Paris Fashion Week.',
    focusKeyword: 'haute couture',
    faqs: [
      {
        id: 'faq_1',
        question: 'What defines authentic Haute Couture in Paris?',
        answer: 'To earn the official Haute Couture designation, houses must be approved by the Chambre Syndicale de la Haute Couture and meet strict criteria, including custom fittings and hand-crafted ateliers in Paris.'
      },
      {
        id: 'faq_2',
        question: 'How long does a typical couture gown take to construct?',
        answer: 'Artisans invest between 100 to over 1,500 hours depending on the complexity of hand embroidery, beadwork, and custom draping.'
      }
    ],
  },
  {
    id: 'post_02',
    title: 'Venice International Film Festival: The 10 Most Anticipated Cinematic Masterpieces',
    slug: 'venice-film-festival-most-anticipated-cinematic-masterpieces',
    excerpt: 'From haunting psychological thrillers on the Lido to visionary indie epics, our comprehensive guide to this year’s Golden Lion contenders.',
    content: `
<h2>A Star-Studded Lido Celebration</h2>
<p>The Palazzo del Cinema is ablaze with luminous energy as international auteurs, cinematic visionaries, and screen icons convene for the historic Venice International Film Festival. The lineup this year strikes an exceptional balance between introspective chamber dramas and visually stunning grand spectacles.</p>

<figure class="my-8">
  <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80" alt="Venice Film Festival Red Carpet" class="w-full rounded-lg shadow-md" />
  <figcaption class="text-xs text-stone-500 mt-2 text-center italic">The Lido red carpet prior to the world premiere gala screening.</figcaption>
</figure>

<h3>Top Highlights to Watch</h3>
<p>Critics have been captivated by groundbreaking storytelling that interrogates memory, identity, and ecological transformations. High-contrast cinematography and immersive soundscapes dominate this year's festival selections.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'The historic Sala Grande on the Lido preparing for the festival opener.',
    authorId: INITIAL_USERS[1].id,
    author: {
      id: INITIAL_USERS[1].id,
      name: INITIAL_USERS[1].name,
      username: INITIAL_USERS[1].username,
      avatar: INITIAL_USERS[1].avatar,
      bio: INITIAL_USERS[1].bio,
    },
    categoryId: 'cat_entertainment',
    category: {
      id: 'cat_entertainment',
      name: 'Entertainment',
      slug: 'entertainment',
      color: '#E11D48',
    },
    subCategoryId: 'cat_ent_movies',
    subCategory: {
      id: 'cat_ent_movies',
      name: 'Movies News & Updates',
      slug: 'movies-news',
    },
    tagIds: ['tag_3'],
    tags: [INITIAL_TAGS[2]],
    status: 'published',
    isFeatured: true,
    isTrending: true,
    isEditorPick: false,
    views: 14220,
    likes: 620,
    readingTime: 6,
    publishedAt: '2026-08-11T14:30:00Z',
    updatedAt: '2026-08-11T14:30:00Z',
    createdAt: '2026-08-11T12:00:00Z',
  },
  {
    id: 'post_03',
    title: 'The Art of Mindful Longevity: Daily Micro-Habits for Cellular Vitality & Calm',
    slug: 'art-of-mindful-longevity-daily-micro-habits',
    excerpt: 'Modern neuroscientists and holistic practitioners share the morning rituals, circadian alignments, and breathwork frameworks that transform daily vitality.',
    content: `
<h2>Bridging Neuroscience & Timeless Wellness</h2>
<p>Longevity is no longer viewed solely as the accumulation of years, but as the intentional cultivation of vitality, cognitive clarity, and emotional equilibrium. By implementing small, scientifically validated micro-habits, you can profoundly influence cellular regeneration and stress resilience.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Morning meditation overlooking the Mediterranean coastline.',
    authorId: INITIAL_USERS[2].id,
    author: {
      id: INITIAL_USERS[2].id,
      name: INITIAL_USERS[2].name,
      username: INITIAL_USERS[2].username,
      avatar: INITIAL_USERS[2].avatar,
      bio: INITIAL_USERS[2].bio,
    },
    categoryId: 'cat_lifestyle',
    category: {
      id: 'cat_lifestyle',
      name: 'Women Lifestyle',
      slug: 'women-lifestyle',
      color: '#8B5CF6',
    },
    subCategoryId: 'cat_wellness',
    subCategory: {
      id: 'cat_wellness',
      name: 'Wellness',
      slug: 'wellness',
    },
    tagIds: ['tag_4', 'tag_6'],
    tags: [INITIAL_TAGS[3], INITIAL_TAGS[5]],
    status: 'published',
    isFeatured: true,
    isTrending: false,
    isEditorPick: true,
    views: 11980,
    likes: 540,
    readingTime: 4,
    publishedAt: '2026-08-10T08:15:00Z',
    updatedAt: '2026-08-10T08:15:00Z',
    createdAt: '2026-08-10T07:00:00Z',
  },
  {
    id: 'post_04',
    title: 'Sanctuaries of the Aegean: Secluded Boutique Retreats of the Cyclades',
    slug: 'sanctuaries-of-aegean-boutique-retreats-cyclades',
    excerpt: 'Escape the tourist crowds with these architecturally striking, cliffside sanctuaries nestled across Milos, Sifnos, and Folegandros.',
    content: `
<h2>Sunlit Whitewashed Havens</h2>
<p>Beyond the bustling promenades of Santorini and Mykonos lie untouched enclaves where ancient olive groves meet sapphire waters. Here, minimalist Cycladic architecture blends seamlessly with the natural topography.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Cliffside retreat in the Greek islands.',
    authorId: INITIAL_USERS[1].id,
    author: {
      id: INITIAL_USERS[1].id,
      name: INITIAL_USERS[1].name,
      username: INITIAL_USERS[1].username,
      avatar: INITIAL_USERS[1].avatar,
      bio: INITIAL_USERS[1].bio,
    },
    categoryId: 'cat_travel',
    category: {
      id: 'cat_travel',
      name: 'Travel & Escapes',
      slug: 'travel',
      color: '#0EA5E9',
    },
    tagIds: ['tag_5'],
    tags: [INITIAL_TAGS[4]],
    status: 'published',
    isFeatured: false,
    isTrending: true,
    isEditorPick: true,
    views: 9450,
    likes: 410,
    readingTime: 5,
    publishedAt: '2026-08-09T16:00:00Z',
    updatedAt: '2026-08-09T16:00:00Z',
    createdAt: '2026-08-09T14:00:00Z',
  },
  {
    id: 'post_05',
    title: 'The Michelin Guide to Contemporary Fermentation & Botanical Dining',
    slug: 'michelin-guide-contemporary-fermentation-botanical-dining',
    excerpt: 'How pioneering chefs in Copenhagen, Tokyo, and San Sebastian are elevating wild foraging and koji fermentation into high culinary art.',
    content: `
<h2>The Living Alchemy of Taste</h2>
<p>Modern culinary artists are moving away from heavy reductions and embracing living cultures, barrel-aged garums, and biodynamic terroir.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Artisanal plated gastronomy featuring heritage wild herbs.',
    authorId: INITIAL_USERS[0].id,
    author: {
      id: INITIAL_USERS[0].id,
      name: INITIAL_USERS[0].name,
      username: INITIAL_USERS[0].username,
      avatar: INITIAL_USERS[0].avatar,
    },
    categoryId: 'cat_food',
    category: {
      id: 'cat_food',
      name: 'Food & Wine',
      slug: 'food-wine',
      color: '#D97706',
    },
    tagIds: ['tag_8'],
    tags: [INITIAL_TAGS[7]],
    status: 'published',
    isFeatured: false,
    isTrending: false,
    isEditorPick: true,
    views: 8120,
    likes: 395,
    readingTime: 4,
    publishedAt: '2026-08-08T11:45:00Z',
    updatedAt: '2026-08-08T11:45:00Z',
    createdAt: '2026-08-08T10:00:00Z',
  },
  {
    id: 'post_06',
    title: 'The Psychology of Modern Romance: Navigating Hyper-Connectivity & Deep Attachment',
    slug: 'psychology-modern-romance-hyper-connectivity-deep-attachment',
    excerpt: 'Relationship therapists unpack why intentional digital boundaries and emotional attunement are essential for lasting intimacy today.',
    content: `
<h2>Creating Sacred Space in a Distracted Era</h2>
<p>In an age where notifications compete relentlessly for our attention, cultivating presence in relationships has become the ultimate expression of love and commitment.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Couples embracing meaningful conversational presence.',
    authorId: INITIAL_USERS[2].id,
    author: {
      id: INITIAL_USERS[2].id,
      name: INITIAL_USERS[2].name,
      username: INITIAL_USERS[2].username,
      avatar: INITIAL_USERS[2].avatar,
    },
    categoryId: 'cat_lifestyle',
    category: {
      id: 'cat_lifestyle',
      name: 'Women Lifestyle',
      slug: 'women-lifestyle',
      color: '#8B5CF6',
    },
    subCategoryId: 'cat_relationship',
    subCategory: {
      id: 'cat_relationship',
      name: 'Relationship',
      slug: 'relationship',
    },
    tagIds: ['tag_4'],
    tags: [INITIAL_TAGS[3]],
    status: 'published',
    isFeatured: false,
    isTrending: true,
    isEditorPick: false,
    views: 7600,
    likes: 480,
    readingTime: 5,
    publishedAt: '2026-08-07T13:00:00Z',
    updatedAt: '2026-08-07T13:00:00Z',
    createdAt: '2026-08-07T11:00:00Z',
  },
  {
    id: 'post_07',
    title: 'Strategic Capital: How Female Venture Founders Are Reshaping Global Tech',
    slug: 'strategic-capital-female-venture-founders-reshaping-tech',
    excerpt: 'An insider look into new institutional funds prioritizing AI ethics, climate intelligence, and healthcare democratization.',
    content: `
<h2>A New Paradigm in Venture Capital</h2>
<p>Visionary leaders are directing capital into high-impact enterprises, demonstrating that sustainable governance and rapid scaling can coexist effortlessly.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Venture strategists discussing portfolio impact.',
    authorId: INITIAL_USERS[0].id,
    author: {
      id: INITIAL_USERS[0].id,
      name: INITIAL_USERS[0].name,
      username: INITIAL_USERS[0].username,
      avatar: INITIAL_USERS[0].avatar,
    },
    categoryId: 'cat_career',
    category: {
      id: 'cat_career',
      name: 'Career & Finance',
      slug: 'career-finance',
      color: '#3B82F6',
    },
    tagIds: ['tag_7', 'tag_9'],
    tags: [INITIAL_TAGS[6], INITIAL_TAGS[8]],
    status: 'published',
    isFeatured: false,
    isTrending: false,
    isEditorPick: true,
    views: 6300,
    likes: 310,
    readingTime: 4,
    publishedAt: '2026-08-06T09:20:00Z',
    updatedAt: '2026-08-06T09:20:00Z',
    createdAt: '2026-08-06T08:00:00Z',
  },
  {
    id: 'post_08',
    title: 'Clean Beauty Formulations: The Botanical Actives Replacing Synthetic Fillers',
    slug: 'clean-beauty-botanical-actives-replacing-synthetic-fillers',
    excerpt: 'Dermatologists and cosmetic chemists break down the clinical efficacy of bakuchiol, snow mushroom extract, and marine bio-ferments.',
    content: `
<h2>The Clinical Power of Green Chemistry</h2>
<p>Modern clean beauty has graduated from gentle oils to high-potency, laboratory-verified botanical complexes that match retinol and peptide efficacy without irritation.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption: 'Botanical skincare formulations in natural light.',
    authorId: INITIAL_USERS[2].id,
    author: {
      id: INITIAL_USERS[2].id,
      name: INITIAL_USERS[2].name,
      username: INITIAL_USERS[2].username,
      avatar: INITIAL_USERS[2].avatar,
    },
    categoryId: 'cat_lifestyle',
    category: {
      id: 'cat_lifestyle',
      name: 'Women Lifestyle',
      slug: 'women-lifestyle',
      color: '#8B5CF6',
    },
    subCategoryId: 'cat_beauty',
    subCategory: {
      id: 'cat_beauty',
      name: 'Beauty',
      slug: 'beauty',
    },
    tagIds: ['tag_6'],
    tags: [INITIAL_TAGS[5]],
    status: 'published',
    isFeatured: false,
    isTrending: true,
    isEditorPick: false,
    views: 10240,
    likes: 580,
    readingTime: 4,
    publishedAt: '2026-08-05T15:00:00Z',
    updatedAt: '2026-08-05T15:00:00Z',
    createdAt: '2026-08-05T12:00:00Z',
  }
];

export const INITIAL_PAGES: Page[] = [
  {
    id: 'page_about',
    title: 'About Us',
    slug: 'about-us',
    content: `
<h2>About Naya Andaaz</h2>
<p>Naya Andaaz is an independent digital publication exploring the frontiers of modern lifestyle, entertainment, beauty, wellness, fashion, relationships, culture, and visionary living.</p>
<p>Naya Andaaz stands at the intersection of engaging storytelling, authentic perspectives, and inspiring lifestyle journalism for contemporary readers.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    authorId: INITIAL_USERS[0].id,
    authorName: INITIAL_USERS[0].name,
    seoTitle: 'About Us — Mission & Editorial Philosophy | Naya Andaaz',
    metaDescription: 'Learn about Naya Andaaz, our editorial team, and dedication to modern lifestyle and cultural storytelling.',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'page_contact',
    title: 'Contact Us',
    slug: 'contact-us',
    content: `
<h2>Get in Touch with Naya Andaaz</h2>
<p>We welcome editorial pitches, press releases, advertising collaborations, and general inquiries from our community.</p>
<p><strong>Editorial Desk & Inquiries:</strong> hello@nayaandaaz.com<br /><strong>Advertising & Partnerships:</strong> hello@nayaandaaz.com<br /><strong>Press Office:</strong> hello@nayaandaaz.com</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    authorId: INITIAL_USERS[0].id,
    authorName: INITIAL_USERS[0].name,
    seoTitle: 'Contact Us — Editorial & Business Inquiries | Naya Andaaz',
    metaDescription: 'Get in touch with Naya Andaaz editorial desk, advertising team, and press office. Reach us at hello@nayaandaaz.com.',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'page_privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `
<h2>Privacy Policy</h2>
<p>At Naya Andaaz, accessible from https://www.nayaandaaz.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Naya Andaaz and how we use it.</p>
<p>We respect your privacy and never sell or monetize personal identification data.</p>
    `,
    status: 'published',
    authorId: INITIAL_USERS[0].id,
    authorName: INITIAL_USERS[0].name,
    seoTitle: 'Privacy Policy | Naya Andaaz',
    metaDescription: 'Privacy Policy and data protection guidelines for Naya Andaaz. Learn how we handle and protect your information.',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'page_terms',
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    content: `
<h2>1. Acceptance of Terms</h2>
<p>Welcome to Naya Andaaz (accessible at www.nayaandaaz.com). These Terms &amp; Conditions govern your access to and use of our digital publication, features, and content. By accessing or using our platform, you accept and agree to be bound by these terms.</p>

<h2>2. Permitted Use &amp; Acceptable Behavior</h2>
<p>Naya Andaaz is provided for your personal, non-commercial reading and informational enjoyment. You agree not to engage in unauthorized data scraping, harvesting, or reverse-engineering of our editorial material. Automated crawling or extraction is strictly prohibited without prior written consent.</p>

<h2>3. Content Disclaimers &amp; Advice Notice</h2>
<p>Articles covering health, wellness, beauty, nutrition, finance, or lifestyle are created for informative and entertainment purposes only. They do not constitute certified medical, diagnostic, legal, or licensed financial advice. Readers should always consult certified professionals regarding specific health, fitness, or financial decisions.</p>

<h2>4. Intellectual Property &amp; Copyright</h2>
<p>All editorial articles, original photographs, graphics, layouts, and brand assets on Naya Andaaz are protected by copyright and intellectual property laws. You may not republish, syndicate, or redistribute content without express permission.</p>

<h2>5. User Submissions &amp; Comments</h2>
<p>Reader comments and editorial contributions must adhere to our community guidelines. Defamatory, abusive, or unlawful submissions will be removed.</p>

<h2>6. Advertising &amp; Sponsored Content</h2>
<p>Sponsored content and commercial partnerships are clearly identified to our audience. We maintain editorial independence from commercial sponsors.</p>

<h2>7. Governing Law &amp; Contact</h2>
<p>These terms are governed by the laws of India. For editorial inquiries or grievance redressal, contact our desk at hello@nayaandaaz.com.</p>
    `,
    status: 'published',
    authorId: INITIAL_USERS[0].id,
    authorName: INITIAL_USERS[0].name,
    seoTitle: 'Terms & Conditions | Naya Andaaz',
    metaDescription: 'Read the Terms & Conditions governing the use of Naya Andaaz, including editorial content, intellectual property, advertising, and website policies.',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med_01',
    title: 'Paris Atelier Couture Stitching',
    fileName: 'paris-atelier-couture.jpg',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg',
    fileSize: 1420500,
    width: 1200,
    height: 800,
    altText: 'Paris Atelier couture stitching work',
    caption: 'Master artisan hand embroidery in Parisian studio.',
    uploadedBy: INITIAL_USERS[0].id,
    uploadedByName: INITIAL_USERS[0].name,
    createdAt: '2026-08-12T08:30:00Z',
  },
  {
    id: 'med_02',
    title: 'Venice Film Festival Red Carpet',
    fileName: 'venice-film-festival.jpg',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg',
    fileSize: 1890200,
    width: 1200,
    height: 750,
    altText: 'Venice Film Festival Red Carpet',
    caption: 'Lido Cinema Gala.',
    uploadedBy: INITIAL_USERS[1].id,
    uploadedByName: INITIAL_USERS[1].name,
    createdAt: '2026-08-11T11:00:00Z',
  },
  {
    id: 'med_03',
    title: 'Mediterranean Morning Meditation',
    fileName: 'mediterranean-wellness.jpg',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg',
    fileSize: 1150400,
    width: 1200,
    height: 800,
    altText: 'Mediterranean Morning Wellness',
    uploadedBy: INITIAL_USERS[2].id,
    uploadedByName: INITIAL_USERS[2].name,
    createdAt: '2026-08-10T06:40:00Z',
  },
  {
    id: 'med_04',
    title: 'Santorini Cliffside Retreat',
    fileName: 'cyclades-boutique.jpg',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg',
    fileSize: 1680300,
    width: 1200,
    height: 900,
    altText: 'Santorini Cliffside Retreat',
    uploadedBy: INITIAL_USERS[1].id,
    uploadedByName: INITIAL_USERS[1].name,
    createdAt: '2026-08-09T13:10:00Z',
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act_01',
    userId: INITIAL_USERS[0].id,
    userName: INITIAL_USERS[0].name,
    userAvatar: INITIAL_USERS[0].avatar,
    action: 'publish',
    targetType: 'post',
    targetTitle: 'The Renaissance of Haute Couture: Inside the Atelier Secrets',
    timestamp: '2026-08-12T10:00:00Z',
  },
  {
    id: 'act_02',
    userId: INITIAL_USERS[1].id,
    userName: INITIAL_USERS[1].name,
    userAvatar: INITIAL_USERS[1].avatar,
    action: 'publish',
    targetType: 'post',
    targetTitle: 'Venice International Film Festival: The 10 Most Anticipated Cinematic Masterpieces',
    timestamp: '2026-08-11T14:30:00Z',
  },
  {
    id: 'act_03',
    userId: INITIAL_USERS[2].id,
    userName: INITIAL_USERS[2].name,
    userAvatar: INITIAL_USERS[2].avatar,
    action: 'publish',
    targetType: 'post',
    targetTitle: 'The Art of Mindful Longevity: Daily Micro-Habits for Cellular Vitality',
    timestamp: '2026-08-10T08:15:00Z',
  },
  {
    id: 'act_04',
    userId: INITIAL_USERS[0].id,
    userName: INITIAL_USERS[0].name,
    userAvatar: INITIAL_USERS[0].avatar,
    action: 'update',
    targetType: 'setting',
    targetTitle: 'Site General SEO & Layout Settings',
    timestamp: '2026-08-08T16:00:00Z',
  }
];
