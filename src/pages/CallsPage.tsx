import React from 'react';
import { Phone, Video } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';

const CallsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Calls" />

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Phone className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
        <p className="text-lg font-medium">Voice & Video Calls</p>
        <p className="text-sm mt-2 text-center max-w-xs">
          We're working hard to bring you voice and video calling features. Stay tuned!
        </p>
        <div className="flex gap-4 mt-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs">Voice Call</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs">Video Call</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CallsPage;
