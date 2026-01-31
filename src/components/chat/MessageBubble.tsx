import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck, FileText, Download, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  showTail?: boolean;
  isOwn?: boolean;
}

export const MessageBubble = ({ message, showTail = true, isOwn = false }: MessageBubbleProps) => {
  const [showFullImage, setShowFullImage] = useState(false);

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

  const renderMediaContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="mb-1">
            <img 
              src={message.mediaUrl} 
              alt="Image"
              className="rounded-lg max-w-[280px] max-h-[300px] object-cover cursor-pointer"
              onClick={() => setShowFullImage(true)}
            />
            {message.content && !message.content.startsWith('📷') && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mt-1">
                {message.content}
              </p>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div className="mb-1">
            <video 
              src={message.mediaUrl} 
              controls
              className="rounded-lg max-w-[280px] max-h-[300px]"
            />
            {message.content && !message.content.startsWith('🎥') && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mt-1">
                {message.content}
              </p>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="mb-1">
            <audio src={message.mediaUrl} controls className="max-w-[250px]" />
            {message.content && !message.content.startsWith('🎵') && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mt-1">
                {message.content}
              </p>
            )}
          </div>
        );
      
      case 'document':
        return (
          <div className="mb-1">
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{message.fileName || 'Document'}</p>
                {message.fileSize && (
                  <p className="text-xs opacity-70">
                    {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Download className="h-5 w-5 opacity-70" />
            </a>
            {message.content && !message.content.startsWith('📄') && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mt-1">
                {message.content}
              </p>
            )}
          </div>
        );
      
      default:
        return (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <>
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
          {renderMediaContent()}

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

      {/* Full image modal */}
      {showFullImage && message.mediaUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
            onClick={() => setShowFullImage(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={message.mediaUrl} 
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
};
