import React, { useState } from 'react';
import { Plus, Camera } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { statuses, contacts, currentUser } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const StatusPage = () => {
  const [viewingStatus, setViewingStatus] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const myStatuses = statuses.filter(s => s.userId === currentUser.id);
  const recentStatuses = statuses.filter(s => 
    s.userId !== currentUser.id && !s.viewedBy.includes(currentUser.id)
  );
  const viewedStatuses = statuses.filter(s => 
    s.userId !== currentUser.id && s.viewedBy.includes(currentUser.id)
  );

  const getContact = (userId: string) => contacts.find(c => c.id === userId);

  const handleStatusClick = (statusId: string) => {
    setViewingStatus(statusId);
    setStatusIndex(0);
  };

  const closeStatusViewer = () => {
    setViewingStatus(null);
  };

  const viewingStatusData = viewingStatus ? statuses.find(s => s.id === viewingStatus) : null;
  const viewingContact = viewingStatusData ? getContact(viewingStatusData.userId) : null;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Status" showCamera />

      {/* My Status */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt="My status"
              className="h-14 w-14 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">My Status</h3>
            <p className="text-sm text-muted-foreground">
              {myStatuses.length > 0 
                ? `${myStatuses.length} status update${myStatuses.length > 1 ? 's' : ''}`
                : 'Tap to add status update'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recent updates */}
      {recentStatuses.length > 0 && (
        <div className="mt-4">
          <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent updates
          </h4>
          <div className="divide-y divide-border">
            {recentStatuses.map(status => {
              const contact = getContact(status.userId);
              if (!contact) return null;

              return (
                <button
                  key={status.id}
                  onClick={() => handleStatusClick(status.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-whatsapp-teal">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-full w-full rounded-full object-cover border-2 border-background"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(status.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Viewed updates */}
      {viewedStatuses.length > 0 && (
        <div className="mt-4">
          <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Viewed updates
          </h4>
          <div className="divide-y divide-border">
            {viewedStatuses.map(status => {
              const contact = getContact(status.userId);
              if (!contact) return null;

              return (
                <button
                  key={status.id}
                  onClick={() => handleStatusClick(status.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full p-0.5 bg-muted-foreground/30">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-full w-full rounded-full object-cover border-2 border-background"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(status.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fixed bottom-24 right-4 lg:bottom-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-whatsapp-green-dark transition-colors">
        <Camera className="h-6 w-6" />
      </button>

      {/* Status Viewer */}
      {viewingStatus && viewingStatusData && viewingContact && (
        <div 
          className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in-up"
          onClick={closeStatusViewer}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-10">
            <div className="h-full bg-white animate-status-progress" />
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center gap-3">
            <img
              src={viewingContact.avatar}
              alt={viewingContact.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{viewingContact.name}</h3>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(viewingStatusData.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          {viewingStatusData.type === 'text' ? (
            <div 
              className="flex-1 flex items-center justify-center p-8"
              style={{ backgroundColor: viewingStatusData.backgroundColor }}
            >
              <p className="text-2xl text-white text-center font-medium">
                {viewingStatusData.caption}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <img
                src={viewingStatusData.mediaUrl}
                alt="Status"
                className="max-h-full max-w-full object-contain"
              />
              {viewingStatusData.caption && (
                <div className="absolute bottom-20 left-0 right-0 px-4 py-2 bg-black/50">
                  <p className="text-white text-center">{viewingStatusData.caption}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default StatusPage;
