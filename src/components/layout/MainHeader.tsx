import React from 'react';
import { Search, MoreVertical, Moon, Sun, Users, CheckCheck, Settings, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainHeaderProps {
  title: string;
  showCamera?: boolean;
  onNewGroup?: () => void;
  onReadAll?: () => void;
}

export const MainHeader = ({ title, showCamera = false, onNewGroup, onReadAll }: MainHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSettingsPage = location.pathname === '/settings';
  const isChatPage = location.pathname === '/chats';
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-header text-header-foreground px-4 py-3.5 md:py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-1 md:gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation" 
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-6 w-6 md:h-5 md:w-5" />
          ) : (
            <Moon className="h-6 w-6 md:h-5 md:w-5" />
          )}
        </button>
        <button className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="Search">
          <Search className="h-6 w-6 md:h-5 md:w-5" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="More options">
              <MoreVertical className="h-6 w-6 md:h-5 md:w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isChatPage && onNewGroup && (
              <>
                <DropdownMenuItem onClick={onNewGroup}>
                  <Users className="h-4 w-4 mr-2" />
                  New Group
                </DropdownMenuItem>
                {onReadAll && (
                  <DropdownMenuItem onClick={onReadAll}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All as Read
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
