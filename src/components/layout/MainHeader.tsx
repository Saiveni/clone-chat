import React from 'react';
import { Search, MoreVertical, Camera } from 'lucide-react';

interface MainHeaderProps {
  title: string;
  showCamera?: boolean;
}

export const MainHeader = ({ title, showCamera = false }: MainHeaderProps) => {
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
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
