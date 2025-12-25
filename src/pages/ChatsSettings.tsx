import React from 'react';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const ChatsSettings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-header text-header-foreground px-4 py-3.5 md:py-3 flex items-center gap-3 shadow-sm sticky top-0 z-50">
        <button
          onClick={() => navigate('/settings')}
          className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6 md:h-5 md:w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Chats</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
          <div className="bg-card rounded-lg shadow-sm divide-y divide-border">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors touch-manipulation',
                    isSelected && 'bg-primary/10'
                  )}
                >
                  <div className={cn(
                    'h-11 w-11 md:h-10 md:w-10 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  )}>
                    <Icon className="h-6 w-6 md:h-5 md:w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-base md:text-sm">{option.label}</h3>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Choose your preferred theme for the app
        </p>
      </div>
    </div>
  );
};

export default ChatsSettings;
