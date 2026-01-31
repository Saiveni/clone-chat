import React, { useState } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, X } from 'lucide-react';
import { Contact } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ChatHeaderProps {
  contact: Contact;
  onBack: () => void;
}

export const ChatHeader = ({ contact, onBack }: ChatHeaderProps) => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const getStatusText = () => {
    if (contact.isOnline) {
      return 'online';
    }
    return `last seen ${formatDistanceToNow(contact.lastSeen, { addSuffix: true })}`;
  };

  return (
    <header className="bg-header text-header-foreground px-2 py-2 flex items-center gap-2 shadow-sm">
      {/* Back button */}
      <button
        onClick={onBack}
        className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Avatar */}
      <div className="relative">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        {contact.isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-header" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate">{contact.name}</h2>
        <p className="text-xs text-header-foreground/70 truncate">
          {getStatusText()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setShowComingSoon(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Video className="h-5 w-5" />
        </button>
        <button 
          onClick={() => setShowComingSoon(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Coming Soon Dialog */}
      {showComingSoon && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowComingSoon(false)}
        >
          <div 
            className="bg-card rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
              <button 
                onClick={() => setShowComingSoon(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Voice and video calling features are coming soon! Stay tuned for updates.
              </p>
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mt-4"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
