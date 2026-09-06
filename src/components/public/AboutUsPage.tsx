'use client';

import React from 'react';
import { SiteSettings } from '@/types';
import { AboutUsDocument } from './document/AboutUsDocument';

interface AboutUsPageProps {
  settings?: SiteSettings | null;
}

export function AboutUsPage({ settings: _settings }: AboutUsPageProps) {
  return <AboutUsDocument />;
}
