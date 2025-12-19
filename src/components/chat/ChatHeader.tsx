import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Contact } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

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
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Video className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
