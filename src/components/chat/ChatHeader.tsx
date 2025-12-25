import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Contact } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ChatHeaderProps {
  contact: Contact;
  onBack: () => void;
}

export const ChatHeader = ({ contact, onBack }: ChatHeaderProps) => {
  const getStatusText = () => {
    if (contact.isOnline) {
      return 'online';
    }
    return `last seen ${formatDistanceToNow(contact.lastSeen, { addSuffix: true })}`;
  };

  return (
    <header className="bg-header text-header-foreground px-3 md:px-2 py-2.5 md:py-2 flex items-center gap-2 md:gap-2 shadow-sm sticky top-0 z-50">
      {/* Back button */}
      <button
        onClick={onBack}
        className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation lg:hidden"
        aria-label="Back"
      >
        <ArrowLeft className="h-6 w-6 md:h-5 md:w-5" />
      </button>

      {/* Avatar */}
      <UserAvatar
        name={contact.name}
        avatar={contact.avatar}
        className="h-11 w-11 md:h-10 md:w-10"
        showOnlineStatus={true}
        isOnline={contact.isOnline}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate text-base md:text-sm">{contact.name}</h2>
        <p className="text-xs text-header-foreground/70 truncate">
          {getStatusText()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <button className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="Video call">
          <Video className="h-6 w-6 md:h-5 md:w-5" />
        </button>
        <button className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="Voice call">
          <Phone className="h-6 w-6 md:h-5 md:w-5" />
        </button>
        <button className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation" aria-label="More options">
          <MoreVertical className="h-6 w-6 md:h-5 md:w-5" />
        </button>
      </div>
    </header>
  );
};
