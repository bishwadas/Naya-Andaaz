'use client';

import React, { Suspense } from 'react';
import { TagsManager } from '@/components/admin/TagsManager';
import { Loader2 } from 'lucide-react';

export default function AdminTagsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#EC008C]" />
          <span className="text-xs font-mono">Loading tags management...</span>
        </div>
      }
    >
      <TagsManager />
    </Suspense>
  );
}
