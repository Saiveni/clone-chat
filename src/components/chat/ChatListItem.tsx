import React from 'react';
import { Chat, Contact } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ChatListItemProps {
  chat: Chat;
  contact: Contact | undefined;
  isActive: boolean;
  onClick: () => void;
  isTyping?: boolean;
}

export const ChatListItem = ({ chat, contact, isActive, onClick, isTyping }: ChatListItemProps) => {
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
    try {
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        return '';
      }
      
      const now = new Date();
      const diff = now.getTime() - validDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return validDate.toLocaleDateString([], { weekday: 'short' });
      } else {
        return validDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 md:gap-3 px-4 py-4 md:py-3 hover:bg-secondary/50 active:bg-secondary/70 transition-colors touch-manipulation',
        isActive && 'bg-secondary'
      )}
    >
      {/* Avatar */}
      <UserAvatar
        name={contact.name}
        avatar={contact.avatar}
        className="h-14 w-14 md:h-12 md:w-12"
        showOnlineStatus={true}
        isOnline={contact.isOnline}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground truncate text-base md:text-sm">{contact.name}</h3>
          <span className={cn(
            'text-xs flex-shrink-0 ml-2',
            chat.unreadCount > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'
          )}>
            {chat.lastMessage && formatTime(new Date(chat.lastMessage.timestamp))}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {getStatusIcon()}
            {isTyping ? (
              <span className="text-sm md:text-sm text-primary font-medium">typing...</span>
            ) : (
              <p className="text-sm md:text-sm text-muted-foreground truncate">
                {chat.lastMessage?.content || 'No messages yet'}
              </p>
            )}
          </div>
          {chat.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 h-6 min-w-[24px] md:h-5 md:min-w-[20px] px-2 md:px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
