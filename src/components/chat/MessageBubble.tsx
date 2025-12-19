import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentUser } from '@/data/mockData';

interface MessageBubbleProps {
  message: Message;
  showTail?: boolean;
}

export const MessageBubble = ({ message, showTail = true }: MessageBubbleProps) => {
  const isOwn = message.senderId === currentUser.id;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />;
      case 'sent':
        return <Check className="h-3.5 w-3.5" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5" />;
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-tick-read" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex animate-message-in',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'relative max-w-[75%] rounded-lg px-3 py-2 shadow-sm',
          isOwn 
            ? 'bg-bubble-sent text-bubble-sent-foreground rounded-tr-none' 
            : 'bg-bubble-received text-bubble-received-foreground rounded-tl-none',
          showTail && isOwn && 'mr-2',
          showTail && !isOwn && 'ml-2'
        )}
      >
        {/* Tail */}
        {showTail && (
          <div
            className={cn(
              'absolute top-0 w-3 h-3',
              isOwn 
                ? '-right-2 border-l-[12px] border-l-bubble-sent border-t-[12px] border-t-transparent' 
                : '-left-2 border-r-[12px] border-r-bubble-received border-t-[12px] border-t-transparent'
            )}
            style={{
              clipPath: isOwn 
                ? 'polygon(0 0, 100% 0, 0 100%)' 
                : 'polygon(100% 0, 0 0, 100% 100%)',
            }}
          />
        )}

        {/* Content */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Time and status */}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn(
            'text-[11px]',
            isOwn ? 'text-bubble-sent-foreground/70' : 'text-muted-foreground'
          )}>
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className={cn(
              message.status === 'read' ? 'text-tick-read' : 'text-bubble-sent-foreground/70'
            )}>
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
