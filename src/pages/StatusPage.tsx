import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Pencil, Image, Video, X, Type, Upload } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useStatus } from '@/context/StatusContext';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_COLORS = [
  '#128C7E', '#075E54', '#25D366', '#34B7F1', '#00A884',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

const StatusPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contacts } = useChat();
  const { myStatuses, recentStatuses, viewedStatuses, addStatus, isLoading } = useStatus();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textStatus, setTextStatus] = useState('');
  const [selectedColor, setSelectedColor] = useState(STATUS_COLORS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const getContactInfo = (userId: string) => {
    const contact = contacts.find(c => c.id === userId);
    return contact;
  };

  const handleStatusClick = (statusId: string) => {
    navigate(`/status/${statusId}`);
  };

  const handleMyStatusClick = () => {
    if (myStatuses.length > 0) {
      navigate(`/status/${myStatuses[0].id}`);
    } else {
      setShowAddModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPreviewType(type);
      setShowAddModal(false);
    }
  };

  const handleUploadStatus = async () => {
    if (!previewFile) return;
    
    setIsUploading(true);
    try {
      await addStatus(previewFile, caption, previewType);
      setPreviewFile(null);
      setPreviewUrl(null);
      setCaption('');
    } catch (error) {
      console.error('Error uploading status:', error);
    }
    setIsUploading(false);
  };

  const handleTextStatus = async () => {
    if (!textStatus.trim()) return;
    
    setIsUploading(true);
    try {
      await addStatus(null, textStatus, 'text', selectedColor);
      setTextStatus('');
      setShowTextModal(false);
    } catch (error) {
      console.error('Error creating text status:', error);
    }
    setIsUploading(false);
  };

  // Group statuses by user
  const groupedRecentStatuses = recentStatuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, typeof recentStatuses>);

  const groupedViewedStatuses = viewedStatuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, typeof viewedStatuses>);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Status" showCamera />

      {/* My Status */}
      <div className="px-4 py-3">
        <button 
          onClick={handleMyStatusClick}
          className="w-full flex items-center gap-3 text-left"
        >
          <div className="relative">
            <div className={cn(
              "h-14 w-14 rounded-full p-0.5",
              myStatuses.length > 0 ? "bg-gradient-to-br from-primary to-whatsapp-teal" : ""
            )}>
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="My status"
                className="h-full w-full rounded-full object-cover border-2 border-background"
              />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
              className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">My Status</h3>
            <p className="text-sm text-muted-foreground">
              {myStatuses.length > 0 
                ? `${myStatuses.length} status update${myStatuses.length > 1 ? 's' : ''} · Tap to view`
                : 'Tap to add status update'
              }
            </p>
          </div>
        </button>
        
        {/* Quick upload buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Image className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Add Photo</span>
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Video className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Add Video</span>
          </button>
          <button
            onClick={() => setShowTextModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Type className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Add Text</span>
          </button>
        </div>
      </div>

      {/* Recent updates */}
      {Object.keys(groupedRecentStatuses).length > 0 && (
        <div className="mt-4">
          <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent updates
          </h4>
          <div className="divide-y divide-border">
            {Object.entries(groupedRecentStatuses).map(([userId, userStatuses]) => {
              const contact = getContactInfo(userId);
              const latestStatus = userStatuses[0];

              return (
                <button
                  key={userId}
                  onClick={() => handleStatusClick(latestStatus.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-whatsapp-teal">
                      <img
                        src={contact?.avatar || latestStatus.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                        alt={contact?.name || latestStatus.userName || 'User'}
                        className="h-full w-full rounded-full object-cover border-2 border-background"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">
                      {contact?.name || latestStatus.userName || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userStatuses.length > 1 && `${userStatuses.length} updates · `}
                      {formatDistanceToNow(latestStatus.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Viewed updates */}
      {Object.keys(groupedViewedStatuses).length > 0 && (
        <div className="mt-4">
          <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Viewed updates
          </h4>
          <div className="divide-y divide-border">
            {Object.entries(groupedViewedStatuses).map(([userId, userStatuses]) => {
              const contact = getContactInfo(userId);
              const latestStatus = userStatuses[0];

              return (
                <button
                  key={userId}
                  onClick={() => handleStatusClick(latestStatus.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full p-0.5 bg-muted-foreground/30">
                      <img
                        src={contact?.avatar || latestStatus.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                        alt={contact?.name || latestStatus.userName || 'User'}
                        className="h-full w-full rounded-full object-cover border-2 border-background"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">
                      {contact?.name || latestStatus.userName || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userStatuses.length > 1 && `${userStatuses.length} updates · `}
                      {formatDistanceToNow(latestStatus.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(groupedRecentStatuses).length === 0 && Object.keys(groupedViewedStatuses).length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Camera className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No status updates</p>
          <p className="text-sm">Status updates from contacts will appear here</p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
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

      {/* FAB for camera */}
      <div className="fixed bottom-24 right-4 lg:bottom-6 flex flex-col gap-3">
        <button 
          onClick={() => setShowTextModal(true)}
          className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button 
          onClick={() => setShowAddModal(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-whatsapp-green-dark transition-colors"
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* Add Status Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setShowAddModal(false)}>
          <div 
            className="bg-card w-full max-w-lg rounded-t-2xl p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground text-center">Add Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Image</span>
              </button>
              <button
                onClick={() => {
                  videoInputRef.current?.click();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Video</span>
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowTextModal(true);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Type className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Text</span>
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Text Status Modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: selectedColor }}>
          <div className="p-4 flex items-center justify-between">
            <button onClick={() => setShowTextModal(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={handleTextStatus}
              disabled={!textStatus.trim() || isUploading}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Posting...' : 'Post'}
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8">
            <textarea
              value={textStatus}
              onChange={(e) => setTextStatus(e.target.value)}
              placeholder="Type a status..."
              className="w-full text-2xl md:text-4xl text-white text-center font-medium bg-transparent border-none outline-none resize-none placeholder:text-white/50"
              rows={4}
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="p-4 flex items-center justify-center gap-2 flex-wrap">
            {STATUS_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform",
                  selectedColor === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <button 
              onClick={() => {
                setPreviewFile(null);
                setPreviewUrl(null);
                setCaption('');
              }} 
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4">
            {previewType === 'video' ? (
              <video src={previewUrl} className="max-h-full max-w-full object-contain" controls />
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            )}
          </div>

          <div className="p-4 bg-black/50">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="flex-1 bg-white/10 text-white placeholder:text-white/50 rounded-full px-4 py-3 outline-none"
              />
              <button
                onClick={handleUploadStatus}
                disabled={isUploading}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default StatusPage;
