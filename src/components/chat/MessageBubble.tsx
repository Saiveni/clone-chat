import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  showTail?: boolean;
  isOwn?: boolean;
}

export const MessageBubble = ({ message, showTail = true, isOwn = false }: MessageBubbleProps) => {
  const formatTime = (date: Date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const [imageModalOpen, setImageModalOpen] = React.useState(false);

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

        {/* Image Media */}
        {message.type === 'image' && message.mediaUrl && (
          <>
            <div className="mb-2 rounded overflow-hidden">
              <img 
                src={message.mediaUrl} 
                alt="Shared media"
                className="max-w-full max-h-64 rounded cursor-pointer hover:opacity-90 transition-opacity object-cover"
                onClick={() => setImageModalOpen(true)}
              />
            </div>
            {/* Image Modal */}
            {imageModalOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={() => setImageModalOpen(false)}
              >
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
                >
                  ✕
                </button>
                <img 
                  src={message.mediaUrl} 
                  alt="Full size media"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </>
        )}

        {/* Video Media */}
        {message.type === 'video' && message.mediaUrl && (
          <div className="mb-2 rounded overflow-hidden">
            <video 
              src={message.mediaUrl}
              controls
              className="max-w-full max-h-64 rounded"
            />
          </div>
        )}

        {/* Document Media */}
        {message.type === 'document' && message.mediaUrl && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-background/30 rounded">
            <Download className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{message.content}</p>
            </div>
          </div>
        )}

        {/* Text Content */}
        {message.type === 'text' && (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

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
