'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, CheckCheck, Trash2, ShieldAlert, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications';

export function NotificationPopover() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationsStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const filteredList = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  const getIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return <ShieldAlert className="w-4 h-4 text-neon-blue" />;
      case 'bias':
        return <AlertTriangle className="w-4 h-4 text-neon-amber" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-neon-green" />;
      default:
        return <Info className="w-4 h-4 text-neon-purple" />;
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-neon-red text-white text-[10px] font-bold flex items-center justify-center border-2 border-navy-900 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 mt-2 w-80 md:w-96 max-h-[480px] flex flex-col rounded-2xl border border-white/10',
            'bg-navy-900/95 backdrop-blur-xl p-0 shadow-glow-purple/40',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2'
          )}
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-neon-cyan flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read all</span>
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-neon-red flex items-center gap-1 transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                filter === 'all'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-muted-foreground hover:text-white'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-muted-foreground hover:text-white'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/5">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No notifications found
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    'p-3 rounded-xl transition-all cursor-pointer flex gap-3 items-start',
                    item.read
                      ? 'opacity-70 hover:opacity-100 hover:bg-white/5'
                      : 'bg-neon-purple/5 border border-neon-purple/20 hover:bg-neon-purple/10'
                  )}
                >
                  <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-neon-purple shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
