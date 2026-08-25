'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  Workflow,
  Globe,
  Languages,
  MessageSquareHeart,
  SmilePlus,
  Scale,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  BrainCircuit,
  Network,
  Sparkles,
  GraduationCap,
  Subtitles,
  Mic,
  BarChart3,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Crown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/label';

interface NavItem {
  href: string;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  admin?: boolean;
}

interface NavSection {
  titleKey: string;
  defaultTitle: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: 'overview',
    defaultTitle: 'Overview',
    items: [
      { href: '/dashboard', labelKey: 'dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    titleKey: 'processing',
    defaultTitle: 'Processing',
    items: [
      { href: '/dashboard/upload', labelKey: 'upload', defaultLabel: 'Upload', icon: Upload },
      { href: '/dashboard/language-detect', labelKey: 'languageDetect', defaultLabel: 'Language Detection', icon: Globe },
      { href: '/dashboard/translation', labelKey: 'translation', defaultLabel: 'Translation', icon: Languages },
    ],
  },
  {
    titleKey: 'analysis',
    defaultTitle: 'Analysis',
    items: [
      { href: '/dashboard/sentiment', labelKey: 'sentiment', defaultLabel: 'Sentiment', icon: MessageSquareHeart },
      { href: '/dashboard/emotion', labelKey: 'emotion', defaultLabel: 'Emotion', icon: SmilePlus },
      { href: '/dashboard/bias', labelKey: 'bias', defaultLabel: 'Bias Detection', icon: Scale },
      { href: '/dashboard/fairness', labelKey: 'fairnessAudit', defaultLabel: 'Fairness Audit', icon: ShieldCheck },
    ],
  },
  {
    titleKey: 'verification',
    defaultTitle: 'Verification',
    items: [
      { href: '/dashboard/fact-check', labelKey: 'factCheck', defaultLabel: 'Fact Check', icon: FileCheck2 },
      { href: '/dashboard/misinformation', labelKey: 'misinformation', defaultLabel: 'Misinformation', icon: AlertTriangle },
    ],
  },
  {
    titleKey: 'intelligence',
    defaultTitle: 'Intelligence',
    items: [
      { href: '/dashboard/study-assistant', labelKey: 'studyAssistant', defaultLabel: 'Study Assistant', icon: GraduationCap },
    ],
  },
  {
    titleKey: 'tools',
    defaultTitle: 'Tools',
    items: [
      { href: '/dashboard/subtitles', labelKey: 'subtitles', defaultLabel: 'Subtitles', icon: Subtitles },
      { href: '/dashboard/voice', labelKey: 'voice', defaultLabel: 'Voice', icon: Mic },
    ],
  },
  {
    titleKey: 'admin',
    defaultTitle: 'Admin',
    items: [
      { href: '/dashboard/settings', labelKey: 'settings', defaultLabel: 'Settings', icon: Settings },
      { href: '/dashboard/admin', labelKey: 'admin', defaultLabel: 'Admin Panel', icon: Crown, admin: true },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 260 }}
      className={cn(
        'relative flex flex-col h-screen border-r border-white/10',
        'bg-navy-900/60 backdrop-blur-xl',
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-neon flex items-center justify-center shadow-glow-purple">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm gradient-text leading-tight">
                  FairAudit
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  CLFI Platform
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-neon flex items-center justify-center shadow-glow-purple shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
            'text-muted-foreground hover:text-white hover:bg-white/10',
            collapsed && 'mx-auto',
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {NAV_SECTIONS.map((section, sIdx) => {
          const visibleItems = section.items.filter((it) => !it.admin || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.titleKey}>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 mb-1.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {t(`nav.sections.${section.titleKey}`, section.defaultTitle)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname?.startsWith(item.href);
                  const translatedLabel = t(`nav.${item.labelKey}`, item.defaultLabel);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'relative group flex items-center gap-3 rounded-xl transition-all duration-200',
                          'h-9 px-3 text-sm font-medium',
                          isActive
                            ? 'bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-cyan/10 text-white shadow-glow-purple/40'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5',
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active-bar"
                            className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-neon-blue via-neon-purple to-neon-cyan"
                          />
                        )}
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            isActive && 'text-neon-cyan',
                          )}
                        />
                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              key={item.labelKey + sIdx}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -4 }}
                              className="flex-1 whitespace-nowrap"
                            >
                              {translatedLabel}
                              {item.admin && (
                                <Badge variant="info" className="ml-auto !px-1.5 !text-[9px]">
                                  ADMIN
                                </Badge>
                              )}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 shrink-0">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5',
            collapsed && 'justify-center',
          )}
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-neon flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-navy-900" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role || 'Guest'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-neon-red hover:bg-neon-red/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
