import React, { useState, useRef, KeyboardEvent } from 'react';
import { Smile, Paperclip, Mic, Send, Image, Video, FileText, Music, X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (message: string, type?: 'text' | 'image' | 'video' | 'audio' | 'document', file?: File) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'audio' | 'document'>('image');
  const [isUploading, setIsUploading] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), 'text');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'document') => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
      setPreviewType(type);
      setShowAttachMenu(false);
      
      if (type === 'image' || type === 'video') {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
    // Reset input
    e.target.value = '';
  };

  const handleSendMedia = async () => {
    if (!previewFile) return;
    
    setIsUploading(true);
    try {
      await onSend(message, previewType, previewFile);
      setPreviewFile(null);
      setPreviewUrl(null);
      setMessage('');
    } catch (error) {
      console.error('Error sending media:', error);
      alert('Failed to send media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setMessage('');
  };

  const attachmentOptions = [
    { icon: Image, label: 'Image', color: 'bg-purple-500', ref: imageInputRef, accept: 'image/*' },
    { icon: Video, label: 'Video', color: 'bg-pink-500', ref: videoInputRef, accept: 'video/*' },
    { icon: Music, label: 'Audio', color: 'bg-orange-500', ref: audioInputRef, accept: 'audio/*' },
    { icon: FileText, label: 'Document', color: 'bg-blue-500', ref: documentInputRef, accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx' },
  ];

  // Media preview modal
  if (previewFile) {
    return (
      <div className="bg-secondary/50 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Preview area */}
          <div className="relative bg-background rounded-lg p-4 mb-3">
            <button 
              onClick={cancelPreview}
              className="absolute top-2 right-2 p-1 bg-destructive/10 hover:bg-destructive/20 rounded-full text-destructive"
            >
              <X className="h-5 w-5" />
            </button>
            
            {previewType === 'image' && previewUrl && (
              <div className="flex justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-60 rounded-lg object-contain" />
              </div>
            )}
            
            {previewType === 'video' && previewUrl && (
              <div className="flex justify-center">
                <video src={previewUrl} controls className="max-h-60 rounded-lg" />
              </div>
            )}
            
            {previewType === 'audio' && (
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{previewFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
            
            {previewType === 'document' && (
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{previewFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Caption input and send */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustHeight();
                }}
                placeholder="Add a caption..."
                rows={1}
                className="w-full resize-none rounded-2xl bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMedia}
              disabled={isUploading}
              className="flex-shrink-0 p-3 rounded-full bg-primary text-primary-foreground hover:bg-whatsapp-green-dark transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 px-4 py-3 relative">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'video')}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'audio')}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'document')}
      />

      {/* Attachment menu */}
      {showAttachMenu && (
        <div className="absolute bottom-full left-4 mb-2 bg-card rounded-2xl shadow-lg p-3 animate-scale-in">
          <div className="grid grid-cols-4 gap-3">
            {attachmentOptions.map(({ icon: Icon, label, color, ref, accept }) => (
              <button
                key={label}
                onClick={() => ref.current?.click()}
                className="flex flex-col items-center gap-2"
              >
                <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Emoji button */}
        <button className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
          <Smile className="h-6 w-6" />
        </button>

        {/* Attachment button */}
        <button 
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={cn(
            "flex-shrink-0 p-2 transition-colors rounded-full hover:bg-secondary",
            showAttachMenu ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
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
            onFocus={() => setShowAttachMenu(false)}
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
