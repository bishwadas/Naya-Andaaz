import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DocumentBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function DocumentBreadcrumb({ items }: DocumentBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-stone-500 font-medium mb-6"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-stone-500 hover:text-[#EC008C] transition-colors"
        title="Home"
      >
        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 hover:text-[#EC008C]" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            {isLast || !item.href ? (
              <span className="text-stone-900 font-semibold truncate" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-stone-500 hover:text-[#EC008C] transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
