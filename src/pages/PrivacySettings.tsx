import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [readReceipts, setReadReceipts] = useState(() => {
    const stored = localStorage.getItem('readReceipts');
    return stored ? JSON.parse(stored) : true;
  });

  const handleToggle = (checked: boolean) => {
    setReadReceipts(checked);
    localStorage.setItem('readReceipts', JSON.stringify(checked));
    toast.success(checked ? 'Read receipts enabled' : 'Read receipts disabled');
  };

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
        <h1 className="text-xl md:text-2xl font-bold">Privacy</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-card rounded-lg shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-base">Read Receipts</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If turned off, you won't send or receive read receipts
              </p>
            </div>
            <Switch
              checked={readReceipts}
              onCheckedChange={handleToggle}
              className="ml-4"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Control who can see when you've read their messages
        </p>
      </div>
    </div>
  );
};

export default PrivacySettings;
