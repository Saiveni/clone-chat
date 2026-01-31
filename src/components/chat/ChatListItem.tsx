import React from 'react';
import { Chat, Contact } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface ChatListItemProps {
  chat: Chat;
  contact: Contact | undefined;
  isActive: boolean;
  onClick: () => void;
  isTyping?: boolean;
  searchQuery?: string;
}

export const ChatListItem = ({ chat, contact, isActive, onClick, isTyping, searchQuery }: ChatListItemProps) => {
  const { user } = useAuth();
  
  if (!contact) return null;

  const isOwnMessage = chat.lastMessage?.senderId === user?.id;
  const messageStatus = chat.lastMessage?.status;

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    switch (messageStatus) {
      case 'sent':
        return <Check className="h-4 w-4 text-tick-sent" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-tick-delivered" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-tick-read" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Highlight search query in text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span>
        : part
    );
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors',
        isActive && 'bg-secondary'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        {contact.isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background animate-online-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">
            {searchQuery ? highlightText(contact.name, searchQuery) : contact.name}
          </h3>
          <span className={cn(
            'text-xs',
            chat.unreadCount > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}>
            {chat.lastMessage && formatTime(new Date(chat.lastMessage.timestamp))}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {getStatusIcon()}
            {isTyping ? (
              <span className="text-sm text-primary font-medium">typing...</span>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                {searchQuery && chat.lastMessage?.content 
                  ? highlightText(chat.lastMessage.content, searchQuery)
                  : (chat.lastMessage?.content || 'No messages yet')
                }
              </p>
            )}
          </div>
          {chat.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
