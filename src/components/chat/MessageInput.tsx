import React, { useState, useRef, KeyboardEvent } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (message: string) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="bg-secondary/50 px-4 py-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Emoji button */}
        <button className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
          <Smile className="h-6 w-6" />
        </button>

        {/* Attachment button */}
        <button className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
          <Paperclip className="h-6 w-6" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            className="w-full resize-none rounded-2xl bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send or Voice button */}
        <button
          onClick={message.trim() ? handleSend : undefined}
          className={cn(
            'flex-shrink-0 p-3 rounded-full transition-all',
            message.trim()
              ? 'bg-primary text-primary-foreground hover:bg-whatsapp-green-dark'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          {message.trim() ? (
            <Send className="h-5 w-5" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
};
