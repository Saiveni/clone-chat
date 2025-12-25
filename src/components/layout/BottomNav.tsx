import React from 'react';
import { MessageCircle, Users, Phone, Settings, Zap } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: MessageCircle, label: 'Chats', path: '/chats' },
  { icon: Zap, label: 'Status', path: '/status' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: Phone, label: 'Calls', path: '/calls' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-7xl mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || 
            (path === '/chats' && location.pathname.startsWith('/chat/'));

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 min-w-[60px] transition-colors active:scale-95 touch-manipulation',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-7 w-7', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
