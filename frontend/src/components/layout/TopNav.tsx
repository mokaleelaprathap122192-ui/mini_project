'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { Badge } from '@/components/ui/label';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { NotificationPopover } from '@/components/layout/NotificationPopover';

interface TopNavProps {
  onToggleSidebar?: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 px-4 md:px-6 border-b border-white/10 bg-navy-900/40 backdrop-blur-xl">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files, runs, languages..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-purple/50 focus:ring-2 focus:ring-neon-purple/30 transition-all"
          />
          <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <LanguageSelector />

        <NotificationPopover />

        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-3 h-10 rounded-xl hover:bg-white/10 transition-all shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center text-white text-sm font-bold shadow-glow-purple/50">
                {user?.name?.charAt(0) || <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-white leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize leading-tight">
                  {user?.role || 'Guest'}
                </span>
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                'z-50 mt-2 min-w-[220px] rounded-2xl border border-white/10',
                'bg-navy-900/95 backdrop-blur-xl p-2 shadow-glow-purple/40',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2',
              )}
              sideOffset={8}
              align="end"
            >
              <div className="px-3 py-3 border-b border-white/10 mb-1">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="mt-2 !text-[10px] capitalize">
                  {user?.role} Role
                </Badge>
              </div>
              <DropdownMenu.Item
                onClick={() => router.push('/dashboard/profile')}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/10 outline-none cursor-pointer transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={() => router.push('/dashboard/settings')}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/10 outline-none cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px my-1.5 bg-white/10" />
              <DropdownMenu.Item
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-neon-red hover:bg-neon-red/10 outline-none cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
