'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Facebook,
  Instagram,
  Youtube,
  Home,
  Star,
  Sparkles,
  Plane,
  Utensils,
  Briefcase,
  Heart,
  Tag,
} from 'lucide-react';
import { Category, MenuItem, SiteSettings } from '@/types';
import { useAuth } from '@/lib/auth-client';
import { getCategoryUrl } from '@/lib/categories';

interface NavbarProps {
  categories: Category[];
  settings: SiteSettings | null;
  primaryMenuItems?: MenuItem[];
}

// Custom SVGs for Pinterest and X (Twitter)
const PinterestIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

const XIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Map category labels to appropriate Lucide icons
const getCategoryIcon = (label: string) => {
  const norm = label.toLowerCase().trim();
  if (norm.includes('home')) return <Home className="w-4 h-4 shrink-0" />;
  if (norm.includes('entertain') || norm.includes('movie') || norm.includes('film'))
    return <Star className="w-4 h-4 shrink-0" />;
  if (norm.includes('women') || norm.includes('lifestyle'))
    return <UserIcon className="w-4 h-4 shrink-0" />;
  if (norm.includes('style') || norm.includes('fashion'))
    return <Tag className="w-4 h-4 shrink-0" />;
  if (norm.includes('well') || norm.includes('health') || norm.includes('fitness'))
    return <Sparkles className="w-4 h-4 shrink-0" />;
  if (norm.includes('travel') || norm.includes('escape') || norm.includes('tour'))
    return <Plane className="w-4 h-4 shrink-0" />;
  if (norm.includes('food') || norm.includes('wine') || norm.includes('recipe'))
    return <Utensils className="w-4 h-4 shrink-0" />;
  if (norm.includes('career') || norm.includes('finance') || norm.includes('money'))
    return <Briefcase className="w-4 h-4 shrink-0" />;
  if (norm.includes('relation') || norm.includes('love') || norm.includes('couple'))
    return <Heart className="w-4 h-4 shrink-0" />;
  return <Star className="w-4 h-4 shrink-0" />;
};

export const Navbar: React.FC<NavbarProps> = ({
  categories = [],
  settings,
  primaryMenuItems: initialPrimaryItems,
}) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Scroll visibility state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Dynamic time string
  const [timeString, setTimeString] = useState('Tue, Aug 18, 2026 | Updated 10:04 PM IST');

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialPrimaryItems || []);

  // UI state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [trendingSubcatsMap, setTrendingSubcatsMap] = useState<Record<string, Category[]>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch top 5 trending subcategories dynamically from DB endpoint
  useEffect(() => {
    let isMounted = true;
    fetch('/api/categories/trending-subcategories')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && typeof data === 'object' && !data.error) {
          setTrendingSubcatsMap(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch trending subcategories:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Dynamic Date/Time Formatter
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      const formattedDate = now.toLocaleDateString('en-US', optionsDate);

      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      const formattedTime = now.toLocaleTimeString('en-US', optionsTime);

      setTimeString(`${formattedDate} | Updated ${formattedTime} IST`);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 15000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Primary Menu if not provided
  useEffect(() => {
    if (!initialPrimaryItems || initialPrimaryItems.length === 0) {
      let isMounted = true;
      fetch('/api/menus')
        .then((r) => r.json())
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            const primary = data.find((m: any) => m.location === 'primary');
            if (primary && Array.isArray(primary.items) && primary.items.length > 0) {
              setMenuItems(primary.items);
            }
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, []);

  // 3. Scroll Listener for Smooth Hide/Show
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const prevY = lastScrollY.current;

          if (currentY <= 35) {
            // Near the top: always visible
            setShowHeader(true);
          } else if (currentY > prevY && currentY - prevY > 6) {
            // Scrolling down
            setShowHeader(false);
            setUserDropdownOpen(false);
            setSearchOpen(false);
          } else if (currentY < prevY && prevY - currentY > 6) {
            // Scrolling up
            setShowHeader(true);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setMobileDrawerOpen(false);
  };

  // Toggle category collapse in drawer
  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Fallback nav items if database primary menu has no items yet
  const navLinks =
    menuItems.length > 0
      ? menuItems
      : [
          { id: 'def_home', label: 'Home', url: '/' },
          { id: 'def_ent', label: 'Entertainment', url: '/entertainment' },
          { id: 'def_life', label: 'Women Lifestyle', url: '/women-lifestyle' },
          { id: 'def_style', label: 'Style', url: '/style' },
          { id: 'def_well', label: 'Wellness', url: '/wellness' },
          { id: 'def_travel', label: 'Travel', url: '/travel' },
          { id: 'def_food', label: 'Food & Wine', url: '/food' },
          { id: 'def_career', label: 'Career & Finance', url: '/career-finance' },
          { id: 'def_rel', label: 'Relationships', url: '/relationships' },
        ];

  const getNavItemUrl = (item: Pick<MenuItem, 'url' | 'categorySlug'>) => {
    const linkedCategory = item.categorySlug
      ? categories.find((category) => category.slug.toLowerCase() === item.categorySlug?.toLowerCase())
      : undefined;
    return linkedCategory ? getCategoryUrl(linkedCategory, categories) : item.url;
  };

  // Group categories for drawer
  const drawerParentCats = React.useMemo(() => {
    const parentsFromDb = categories.filter((c) => !c.parentId);
    if (parentsFromDb.length > 0) {
      return parentsFromDb;
    }
    return [
      { id: 'cat_entertainment', name: 'Entertainment', slug: 'entertainment' },
      { id: 'cat_lifestyle', name: 'Women Lifestyle', slug: 'women-lifestyle' },
      { id: 'cat_style', name: 'Style', slug: 'style' },
      { id: 'cat_wellness', name: 'Wellness', slug: 'wellness' },
      { id: 'cat_travel', name: 'Travel', slug: 'travel' },
      { id: 'cat_food', name: 'Food & Wine', slug: 'food' },
      { id: 'cat_career', name: 'Career & Finance', slug: 'career-finance' },
      { id: 'cat_relationships', name: 'Relationships', slug: 'relationships' },
    ] as Category[];
  }, [categories]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP TIME BAR - Fixed at top, NEVER hides on scroll        */}
      {/* ============================================================ */}
      <div
        id="top-time-bar"
        className="fixed top-0 left-0 right-0 z-50 h-8 bg-black text-white border-b border-stone-900 flex items-center justify-between px-3 sm:px-6 select-none"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="text-[11px] sm:text-xs font-medium tracking-tight text-stone-200 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span suppressHydrationWarning>{timeString}</span>
          </div>

          {/* Social Media Links */}
          <div className="hidden sm:flex items-center gap-3.5 text-stone-300">
            <a href="#" className="hover:text-pink-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors" aria-label="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors" aria-label="X">
              <XIcon className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors" aria-label="YouTube">
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors" aria-label="Pinterest">
              <PinterestIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN HEADER + NAVIGATION - Smooth Hide on Scroll Down    */}
      {/* ============================================================ */}
      <header
        id="main-floating-header"
        className={`fixed left-0 right-0 z-40 top-8 bg-white border-b border-stone-200 transition-transform duration-300 ease-in-out shadow-xs ${
          showHeader ? 'translate-y-0' : '-translate-y-[calc(100%+32px)]'
        }`}
      >
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between relative">
          {/* Left Side: Desktop Menu Button / Mobile Brand */}
          <div className="flex items-center gap-3">
            {/* Desktop [ = Menu ] Outline Pill Button */}
            <button
              id="desktop-menu-toggle-btn"
              onClick={() => setMobileDrawerOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500 hover:border-pink-600 bg-white hover:bg-pink-50 text-pink-600 text-xs sm:text-[13.5px] font-bold tracking-tight transition cursor-pointer active:scale-95 shadow-2xs"
              aria-label="Open Navigation Drawer"
            >
              <MenuIcon className="w-4 h-4 text-pink-600" strokeWidth={2.5} />
              <span>Menu</span>
            </button>

            {/* Mobile Brand (Left on mobile) */}
            <div className="md:hidden flex items-center">
              <Link href="/" className="group flex items-center">
                <span className="font-serif text-2xl font-black tracking-[0.12em] text-[#db2777] uppercase">
                  {settings?.siteTitle || 'SEREIA'}
                </span>
              </Link>
            </div>
          </div>

          {/* Center: Brand Logo (Desktop Center) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
            <Link href="/" className="group flex items-center" id="header-brand-logo">
              <span className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-black tracking-[0.16em] text-[#db2777] hover:opacity-90 transition uppercase">
                {settings?.siteTitle || 'SEREIA'}
              </span>
            </Link>
          </div>

          {/* Right Side: Sign In & Search */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Desktop Auth Button */}
            <div className="relative">
              {isAuthenticated && currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    id="desktop-user-menu-btn"
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-pink-500 hover:border-pink-600 bg-white hover:bg-pink-50 text-pink-600 text-xs sm:text-[13.5px] font-bold tracking-tight transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-pink-600" strokeWidth={2.2} />
                    <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-pink-600 hidden sm:inline" />
                  </button>

                  {/* Logged in dropdown */}
                  {userDropdownOpen && (
                    <div
                      id="user-profile-dropdown"
                      className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-xl py-2 z-50 text-xs text-stone-800"
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-bold text-stone-950 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 font-mono text-[9px] uppercase tracking-wider bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded font-bold">
                          {currentUser.role}
                        </span>
                      </div>

                      {(currentUser.role?.toUpperCase() === 'ADMIN' ||
                        currentUser.role?.toUpperCase() === 'EDITOR' ||
                        currentUser.role?.toUpperCase() === 'AUTHOR') && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-stone-800 hover:bg-pink-50 hover:text-pink-600 font-semibold"
                        >
                          <Shield className="w-3.5 h-3.5 text-pink-500" />
                          Admin CMS Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  id="desktop-signin-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-pink-500 hover:border-pink-600 bg-white hover:bg-pink-50 text-pink-600 text-xs sm:text-[13.5px] font-bold tracking-tight transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-pink-600" strokeWidth={2.2} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Search Pill Button */}
            <button
              id="desktop-search-toggle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-pink-500 hover:border-pink-600 bg-white hover:bg-pink-50 text-pink-600 text-xs sm:text-[13.5px] font-bold tracking-tight transition cursor-pointer active:scale-95 shadow-2xs"
              aria-label="Toggle Search"
            >
              <Search className="w-3.5 h-3.5 text-pink-600" strokeWidth={2.2} />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-drawer-toggle-btn"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-full border border-pink-500 text-pink-600 hover:bg-pink-50 transition cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <MenuIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Inline Search Bar */}
        {searchOpen && (
          <div
            id="inline-search-container"
            className="bg-stone-50 border-t border-stone-200 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, breaking news, categories..."
                  className="w-full bg-white border border-stone-300 text-stone-900 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition shadow-xs"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#db2777] hover:bg-pink-700 text-white font-semibold rounded-full text-xs sm:text-sm transition cursor-pointer shadow-xs"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-full transition"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. PRIMARY NAVIGATION BAR - Clean & Minimalist Design        */}
        {/* ============================================================ */}
        <nav
          id="primary-category-navbar"
          className="border-t border-stone-200 border-b border-stone-200 bg-white py-1.5 sm:py-2"
          aria-label="Primary Navigation"
        >
          {/* Desktop & Mobile Scrollable View */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar scrollbar-none py-1 gap-1.5 sm:gap-2.5 md:gap-3.5 lg:gap-5 text-stone-900 select-none">
              {navLinks
                .filter((item) => {
                  const isHomePage = pathname === '/';
                  const isHomeItem =
                    item.url === '/' ||
                    item.label.toLowerCase().trim() === 'home' ||
                    item.id === 'def_home';

                  if (isHomePage && isHomeItem) {
                    return false;
                  }
                  return true;
                })
                .map((item) => {
                  const itemUrl = getNavItemUrl(item);
                  const isActive =
                    itemUrl === '/'
                      ? pathname === '/'
                      : pathname.startsWith(itemUrl) || pathname.includes((item as any).categorySlug || '');

                  const categoryIcon = getCategoryIcon(item.label);

                  return (
                    <Link
                      key={item.id || item.url}
                      href={itemUrl}
                      className="mobile-tablet-nav-link group shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 text-[11.5px] sm:text-[12px] md:text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap text-black hover:text-[#db2777] transition-colors duration-200"
                    >
                      <span className="mobile-tablet-nav-icon text-black group-hover:text-[#db2777] transition-colors duration-200">
                        {categoryIcon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>
      </header>

      {/* ============================================================ */}
      {/* 4. CONTENT SPACER - Prevents content jump beneath header    */}
      {/* ============================================================ */}
      <div
        id="navbar-content-spacer"
        className="h-[112px] sm:h-[126px] md:h-[136px] w-full"
        aria-hidden="true"
      />

      {/* ============================================================ */}
      {/* 5. SLIDE-OUT DRAWER / FULL MENU (Triggered by Menu Button)   */}
      {/* ============================================================ */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-250 ease-out motion-reduce:transition-none ${
          mobileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileDrawerOpen}
      >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-250 ease-out motion-reduce:transition-none"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div
              className={`w-screen max-w-md bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-250 ease-out motion-reduce:transition-none ${
                mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="font-serif text-2xl font-black tracking-[0.12em] text-[#db2777] uppercase"
                >
                  {settings?.siteTitle || 'SEREIA'}
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full text-stone-600 hover:text-black hover:bg-stone-200 transition cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search */}
              <div className="p-4 border-b border-stone-100 bg-white">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stories & topics..."
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#db2777] text-white font-semibold rounded-lg text-xs hover:bg-pink-700 transition"
                  >
                    Go
                  </button>
                </form>
              </div>

              {/* Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Primary Menu with Expandable Parent Categories */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#db2777] mb-3">
                    Primary Menu
                  </h4>
                  <div className="space-y-1">
                    {/* Home Link */}
                    <Link
                      href="/"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-[13.5px] font-bold uppercase text-stone-900 hover:text-[#db2777] hover:bg-pink-50/50 rounded-lg transition"
                    >
                      <span className="text-[#db2777]">{getCategoryIcon('Home')}</span>
                      <span>HOME</span>
                    </Link>

                    {/* Parent Categories with Dynamic Top 5 Trending Subcategories */}
                    {drawerParentCats.map((cat) => {
                      const subcats =
                        trendingSubcatsMap[cat.id] ||
                        trendingSubcatsMap[cat.slug] ||
                        categories.filter((c) => c.parentId === cat.id).slice(0, 5);

                      const top5Subcats = subcats.slice(0, 5);
                      const isExpanded = !!expandedCategories[cat.id] || !!expandedCategories[cat.slug];
                      const hasSubcats = top5Subcats.length > 0;

                      return (
                        <div
                          key={`drawer-parent-${cat.id || cat.slug}`}
                          className="space-y-0.5 border-b border-stone-100/80 pb-1"
                        >
                          <div
                            onClick={() => {
                              if (hasSubcats) {
                                toggleCategoryExpand(cat.id);
                                if (cat.slug && cat.slug !== cat.id) {
                                  toggleCategoryExpand(cat.slug);
                                }
                              } else {
                                router.push(getCategoryUrl(cat, categories));
                                setMobileDrawerOpen(false);
                              }
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition cursor-pointer select-none ${
                              isExpanded
                                ? 'bg-pink-50/80 text-[#db2777] font-bold'
                                : 'hover:bg-stone-50 text-stone-900 font-bold'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <span className="text-[#db2777] shrink-0">
                                {getCategoryIcon(cat.name)}
                              </span>
                              <Link
                                href={getCategoryUrl(cat, categories)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMobileDrawerOpen(false);
                                }}
                                className="text-[13.5px] uppercase tracking-wide hover:text-[#db2777] transition truncate"
                              >
                                {cat.name}
                              </Link>
                            </div>

                            {hasSubcats && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCategoryExpand(cat.id);
                                  if (cat.slug && cat.slug !== cat.id) {
                                    toggleCategoryExpand(cat.slug);
                                  }
                                }}
                                className="p-1 rounded-full text-stone-500 hover:text-[#db2777] transition cursor-pointer shrink-0 ml-1"
                                aria-label={`Toggle ${cat.name} subcategories`}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-[#db2777]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-stone-500" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Subcategories Dropdown List (Max 5) */}
                          {hasSubcats && isExpanded && (
                            <div className="pl-8 pr-3 py-1.5 space-y-1.5 border-l-2 border-pink-200 ml-4 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                              {top5Subcats.map((sub) => (
                                <Link
                                  key={`drawer-sub-${sub.id || sub.slug}`}
                                  href={getCategoryUrl(sub, categories)}
                                  onClick={() => setMobileDrawerOpen(false)}
                                  className="flex items-center gap-2 py-1 text-xs sm:text-[13px] font-medium text-stone-700 hover:text-[#db2777] transition"
                                >
                                  <span className="text-[#db2777] font-extrabold">•</span>
                                  <span className="truncate">{sub.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Editorial Pages */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Information
                  </h4>
                  <div className="space-y-1 text-sm text-stone-600">
                    <Link
                      href="/page/about-us"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block py-1 hover:text-stone-950 transition"
                    >
                      About Sereia
                    </Link>
                    <Link
                      href="/page/contact-us"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block py-1 hover:text-stone-950 transition"
                    >
                      Contact Editorial Team
                    </Link>
                    <Link
                      href="/page/privacy-policy"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block py-1 hover:text-stone-950 transition"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/page/terms-and-conditions"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block py-1 hover:text-stone-950 transition"
                    >
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drawer Footer / Account */}
              <div className="p-5 border-t border-stone-200 bg-stone-50">
                {isAuthenticated && currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-950">{currentUser.name}</p>
                        <p className="text-stone-500">{currentUser.email}</p>
                      </div>
                      <span className="font-mono text-[9px] uppercase bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-bold">
                        {currentUser.role}
                      </span>
                    </div>

                    {(currentUser.role?.toUpperCase() === 'ADMIN' ||
                      currentUser.role?.toUpperCase() === 'EDITOR' ||
                      currentUser.role?.toUpperCase() === 'AUTHOR') && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition shadow-xs"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Admin CMS Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg text-xs transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="text-center py-2.5 border border-pink-500 text-pink-600 hover:bg-pink-50 font-semibold rounded-lg text-xs transition shadow-2xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="text-center py-2.5 bg-[#db2777] hover:bg-pink-700 text-white font-semibold rounded-lg text-xs transition shadow-2xs"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </>
  );
};
