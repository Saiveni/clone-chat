import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { calls, contacts, currentUser } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const CallsPage = () => {
  const getContact = (callerId: string, receiverId: string) => {
    const contactId = callerId === currentUser.id ? receiverId : callerId;
    return contacts.find(c => c.id === contactId);
  };

  const getCallIcon = (call: typeof calls[0]) => {
    const isOutgoing = call.callerId === currentUser.id;
    
    if (call.status === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-destructive" />;
    } else if (isOutgoing) {
      return <PhoneOutgoing className="h-4 w-4 text-primary" />;
    } else {
      return <PhoneIncoming className="h-4 w-4 text-primary" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Calls" />

      {/* Call history */}
      <div className="divide-y divide-border">
        {calls.map(call => {
          const contact = getContact(call.callerId, call.receiverId);
          if (!contact) return null;

          return (
            <div
              key={call.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              <img
                src={contact.avatar}
                alt={contact.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-semibold truncate",
                  call.status === 'missed' ? 'text-destructive' : 'text-foreground'
                )}>
                  {contact.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getCallIcon(call)}
                  <span>
                    {formatDistanceToNow(call.timestamp, { addSuffix: true })}
                    {call.duration && ` · ${formatDuration(call.duration)}`}
                  </span>
                </div>
              </div>
              <button className="p-2 text-primary hover:bg-accent rounded-full transition-colors">
                {call.type === 'video' ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <Phone className="h-5 w-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {calls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Phone className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No recent calls</p>
          <p className="text-sm">Your call history will appear here</p>
        </div>
      )}

      {/* FAB */}
      <button className="fixed bottom-24 right-4 lg:bottom-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-whatsapp-green-dark transition-colors">
        <Phone className="h-6 w-6" />
      </button>

      <BottomNav />
    </div>
  );
};

export default CallsPage;
