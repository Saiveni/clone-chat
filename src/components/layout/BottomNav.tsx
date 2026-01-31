import React from 'react';
import { MessageCircle, Users, CircleDot, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: MessageCircle, label: 'Chats', path: '/chats' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: CircleDot, label: 'Status', path: '/status' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around max-w-4xl mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || 
            (path === '/chats' && location.pathname.startsWith('/chat/')) ||
            (path === '/status' && location.pathname.startsWith('/status/'));

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
