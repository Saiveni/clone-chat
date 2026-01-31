import React, { useState } from 'react';
import { Search, MoreVertical, Camera, X, ArrowLeft, LogOut, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface MainHeaderProps {
  title: string;
  showCamera?: boolean;
  onSearch?: (query: string) => void;
}

export const MainHeader = ({ title, showCamera = false, onSearch }: MainHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const closeSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    onSearch?.('');
  };

  if (isSearching) {
    return (
      <header className="bg-header text-header-foreground px-4 py-3 flex items-center gap-3 shadow-sm">
        <button 
          onClick={closeSearch}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          autoFocus
          className="flex-1 bg-white/10 text-white placeholder:text-white/60 rounded-lg px-4 py-2 outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              onSearch?.('');
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </header>
    );
  }

  return (
    <header className="bg-header text-header-foreground px-4 py-3 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        {showCamera && (
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Camera className="h-5 w-5" />
          </button>
        )}
        <button 
          onClick={() => setIsSearching(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden animate-scale-in">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/contacts');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                >
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">New chat</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Settings</span>
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
