import React from 'react';
import { Search, MoreVertical, Camera } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainHeaderProps {
  title: string;
  showCamera?: boolean;
}

export const MainHeader = ({ title, showCamera = false }: MainHeaderProps) => {
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';

  return (
    <header className="bg-header text-header-foreground px-4 py-3 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        {showCamera && (
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Camera className="h-5 w-5" />
          </button>
        )}
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Search className="h-5 w-5" />
        </button>
        
        {isSettingsPage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile Info</DropdownMenuItem>
              <DropdownMenuItem>Privacy Policy</DropdownMenuItem>
              <DropdownMenuItem>Help Center</DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
};
