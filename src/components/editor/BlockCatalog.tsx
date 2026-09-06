'use client';

import React from 'react';
import {
  Type,
  Image as ImageIcon,
  Grid,
  Quote,
  List,
  ListOrdered,
  Minus,
  Video,
  Youtube,
  Code,
  Columns,
  HelpCircle,
  BookOpen,
  Music,
  Table as TableIcon,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { BlockType } from '@/lib/blocks';

export interface BlockCatalogItem {
  type: BlockType;
  name: string;
  category: 'TEXT' | 'MEDIA' | 'LAYOUT' | 'EMBED';
  icon: React.ReactNode;
  description: string;
  defaultAttrs?: any;
}

export const BLOCK_CATALOG: BlockCatalogItem[] = [
  // TEXT CATEGORY
  {
    type: 'paragraph',
    name: 'Paragraph',
    category: 'TEXT',
    icon: <Type className="w-4 h-4 text-stone-700" />,
    description: 'Start writing standard body text and prose',
  },
  {
    type: 'heading-h2',
    name: 'Heading 2',
    category: 'TEXT',
    icon: <span className="text-xs font-bold font-serif text-stone-900">H2</span>,
    description: 'Main major section heading',
  },
  {
    type: 'heading-h3',
    name: 'Heading 3',
    category: 'TEXT',
    icon: <span className="text-xs font-bold font-serif text-stone-700">H3</span>,
    description: 'Subsection heading',
  },
  {
    type: 'heading-h4',
    name: 'Heading 4',
    category: 'TEXT',
    icon: <span className="text-xs font-bold font-serif text-stone-600">H4</span>,
    description: 'Minor subsection heading',
  },
  {
    type: 'quote',
    name: 'Quote / Pullquote',
    category: 'TEXT',
    icon: <Quote className="w-4 h-4 text-pink-600" />,
    description: 'Emphasized quote with author attribution',
  },
  {
    type: 'list-bullet',
    name: 'Bullet List',
    category: 'TEXT',
    icon: <List className="w-4 h-4 text-stone-700" />,
    description: 'Unordered bulleted list of key items',
  },
  {
    type: 'list-number',
    name: 'Numbered List',
    category: 'TEXT',
    icon: <ListOrdered className="w-4 h-4 text-stone-700" />,
    description: 'Sequential ordered numbered list',
  },
  {
    type: 'table',
    name: 'Table',
    category: 'TEXT',
    icon: <TableIcon className="w-4 h-4 text-pink-600" />,
    description: 'Custom rows and columns data table',
    defaultAttrs: {
      tableData: {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6'],
        ],
        hasHeader: true,
      },
    },
  },
  {
    type: 'table-of-contents',
    name: 'Table of Contents',
    category: 'TEXT',
    icon: <BookOpen className="w-4 h-4 text-pink-600" />,
    description: 'Dynamic navigation generated from article headings',
  },
  {
    type: 'faq',
    name: 'FAQ Accordion',
    category: 'TEXT',
    icon: <HelpCircle className="w-4 h-4 text-pink-600" />,
    description: 'Structured Q&A accordions for reader guidance',
    defaultAttrs: {
      items: [{ question: 'What is the main topic?', answer: 'Detailed response here.' }],
    },
  },
  {
    type: 'alsoRead',
    name: 'Also Read Card',
    category: 'TEXT',
    icon: <BookOpen className="w-4 h-4 text-pink-600" />,
    description: 'Internal article recommendation card',
  },
  {
    type: 'code',
    name: 'Code Block',
    category: 'TEXT',
    icon: <Code className="w-4 h-4 text-stone-700" />,
    description: 'Formatted syntax code snippet',
    defaultAttrs: { language: 'javascript' },
  },

  // MEDIA CATEGORY
  {
    type: 'image',
    name: 'Image',
    category: 'MEDIA',
    icon: <ImageIcon className="w-4 h-4 text-stone-700" />,
    description: 'Single responsive image with caption',
    defaultAttrs: { url: '', alt: '', caption: '' },
  },
  {
    type: 'gallery',
    name: 'Image Gallery',
    category: 'MEDIA',
    icon: <Grid className="w-4 h-4 text-pink-600" />,
    description: 'Multi-image grid gallery',
    defaultAttrs: { images: [] },
  },
  {
    type: 'video',
    name: 'Video Player',
    category: 'MEDIA',
    icon: <Video className="w-4 h-4 text-stone-700" />,
    description: 'Direct MP4 / WebM video stream embed',
    defaultAttrs: { url: '' },
  },
  {
    type: 'audio',
    name: 'Audio Player',
    category: 'MEDIA',
    icon: <Music className="w-4 h-4 text-pink-600" />,
    description: 'MP3 podcast or music track player',
    defaultAttrs: { audioUrl: '', audioTitle: '', audioArtist: '' },
  },

  // LAYOUT CATEGORY
  {
    type: 'button',
    name: 'Button CTA',
    category: 'LAYOUT',
    icon: <ExternalLink className="w-4 h-4 text-pink-600" />,
    description: 'Clickable call-to-action button',
    defaultAttrs: { buttonText: 'Learn More', buttonUrl: '#', buttonStyle: 'primary', buttonAlign: 'left' },
  },
  {
    type: 'columns',
    name: 'Two Columns',
    category: 'LAYOUT',
    icon: <Columns className="w-4 h-4 text-stone-700" />,
    description: 'Side-by-side two column editorial block',
    defaultAttrs: {
      columns: [
        { blocks: [{ content: 'Left column text...' }] },
        { blocks: [{ content: 'Right column text...' }] },
      ],
    },
  },
  {
    type: 'separator',
    name: 'Divider Line',
    category: 'LAYOUT',
    icon: <Minus className="w-4 h-4 text-stone-700" />,
    description: 'Horizontal dividing line rule',
  },
  {
    type: 'spacer',
    name: 'Spacer',
    category: 'LAYOUT',
    icon: <Sliders className="w-4 h-4 text-stone-700" />,
    description: 'Empty space divider with adjustable height',
    defaultAttrs: { height: 40 },
  },

  // EMBED CATEGORY
  {
    type: 'embed',
    name: 'Embed / Social',
    category: 'EMBED',
    icon: <ExternalLink className="w-4 h-4 text-stone-700" />,
    description: 'Embed external content, Spotify, Vimeo, or iframe',
  },
  {
    type: 'youtube',
    name: 'YouTube',
    category: 'EMBED',
    icon: <Youtube className="w-4 h-4 text-red-600" />,
    description: 'Responsive YouTube video embed player',
  },
  {
    type: 'html',
    name: 'Custom HTML',
    category: 'EMBED',
    icon: <Code className="w-4 h-4 text-stone-700" />,
    description: 'Raw HTML, widgets, and embeds',
  },
];
