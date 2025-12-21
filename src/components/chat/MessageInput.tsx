import React, { useState, useRef, KeyboardEvent } from 'react';
import { Smile, Paperclip, Mic, Send, X, Image as ImageIcon, File as FileIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageInputProps {
  onSend: (message: string, type?: 'text' | 'image' | 'video' | 'document', mediaUrl?: string) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; url: string; fileName: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || selectedMedia) {
      if (selectedMedia) {
        let messageType: 'image' | 'video' | 'document' = 'document';
        if (selectedMedia.type.startsWith('image')) {
          messageType = 'image';
        } else if (selectedMedia.type.startsWith('video')) {
          messageType = 'video';
        }
        onSend(message.trim() || selectedMedia.fileName, messageType, selectedMedia.url);
      } else {
        onSend(message.trim());
      }
      setMessage('');
      setSelectedMedia(null);
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setSelectedMedia({ type: file.type, url, fileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
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
      <div className="flex items-end gap-2 max-w-4xl mx-auto flex-col">
        {/* Selected media preview */}
        {selectedMedia && (
          <div className="w-full relative">
            <div className="bg-background rounded-lg p-2 border border-border flex items-center gap-2">
              {selectedMedia.type.startsWith('image') ? (
                <>
                  <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">Image: {selectedMedia.fileName}</span>
                </>
              ) : selectedMedia.type.startsWith('video') ? (
                <>
                  <Video className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">Video: {selectedMedia.fileName}</span>
                </>
              ) : (
                <>
                  <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">File: {selectedMedia.fileName}</span>
                </>
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 w-full">
          {/* Emoji button */}
          <button className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
            <Smile className="h-6 w-6" />
          </button>

          {/* Attachment button */}
          <button 
            onClick={handleAttachmentClick}
            className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
          >
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
            onClick={message.trim() || selectedMedia ? handleSend : undefined}
            className={cn(
              'flex-shrink-0 p-3 rounded-full transition-all',
              (message.trim() || selectedMedia)
                ? 'bg-primary text-primary-foreground hover:bg-whatsapp-green-dark'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            {message.trim() || selectedMedia ? (
              <Send className="h-5 w-5" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
