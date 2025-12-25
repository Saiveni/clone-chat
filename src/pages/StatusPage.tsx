import React, { useState, useRef, useEffect } from 'react';
import { Plus, Camera, X, Eye, Image as ImageIcon, Type, Video } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl?: string;
  caption?: string;
  timestamp: Date;
  viewedBy: string[];
  type: 'image' | 'video' | 'text';
  backgroundColor?: string;
}

const StatusPage = () => {
  const { user } = useAuth();
  const [viewingStatus, setViewingStatus] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [statusType, setStatusType] = useState<'media' | 'text'>('media');
  const [textStatus, setTextStatus] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#25D366');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgColors = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#9C27B0', '#E91E63', '#FF5722'];

  // Load statuses from Firestore - simplified query to avoid index issues
  useEffect(() => {
    const statusesRef = collection(db, 'statuses');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const unsubscribe = onSnapshot(statusesRef, (snapshot) => {
      const loadedStatuses: Status[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate() || new Date();
        
        // Only include statuses from last 24 hours
        if (timestamp > twentyFourHoursAgo) {
          loadedStatuses.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            mediaUrl: data.mediaUrl,
            caption: data.caption,
            timestamp,
            viewedBy: data.viewedBy || [],
            type: data.type || 'image',
            backgroundColor: data.backgroundColor,
          });
        }
      });
      // Sort by timestamp descending
      loadedStatuses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setStatuses(loadedStatuses);
    });

    return () => unsubscribe();
  }, []);

  const myStatuses = statuses.filter(s => s.userId === user?.id);
  const otherStatuses = statuses.filter(s => s.userId !== user?.id);
  const recentStatuses = otherStatuses.filter(s => !s.viewedBy.includes(user?.id || ''));
  const viewedStatuses = otherStatuses.filter(s => s.viewedBy.includes(user?.id || ''));

  const handleStatusClick = (statusId: string) => {
    setViewingStatus(statusId);
  };

  const closeStatusViewer = () => {
    setViewingStatus(null);
  };

  const viewingStatusData = viewingStatus ? statuses.find(s => s.id === viewingStatus) : null;

  const handleAddImageStatus = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const mediaUrl = event.target?.result as string;
        
        await addDoc(collection(db, 'statuses'), {
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar || null,
          mediaUrl,
          type: mediaType,
          timestamp: serverTimestamp(),
          viewedBy: [],
        });
        
        toast.success('Status uploaded!');
        setShowAddStatus(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading status:', error);
      toast.error('Failed to upload status');
    }
  };

  const handleAddTextStatus = async () => {
    if (!textStatus.trim() || !user) return;

    try {
      await addDoc(collection(db, 'statuses'), {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || null,
        caption: textStatus,
        type: 'text',
        backgroundColor: selectedBgColor,
        timestamp: serverTimestamp(),
        viewedBy: [],
      });
      
      toast.success('Status uploaded!');
      setTextStatus('');
      setShowAddStatus(false);
    } catch (error) {
      console.error('Error uploading status:', error);
      toast.error('Failed to upload status');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Status" showCamera />

      {/* My Status */}
      <div className="px-4 py-3">
        <button 
          onClick={() => myStatuses.length > 0 ? handleStatusClick(myStatuses[0].id) : setShowAddStatus(true)}
          className="w-full flex items-center gap-3 hover:bg-secondary/50 rounded-lg p-2 transition-colors"
        >
          <div className="relative">
            {myStatuses.length > 0 ? (
              <div className="h-14 w-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-whatsapp-teal">
                <UserAvatar
                  name={user?.name || 'User'}
                  avatar={user?.avatar}
                  className="h-full w-full border-2 border-background"
                />
              </div>
            ) : (
              <UserAvatar
                name={user?.name || 'User'}
                avatar={user?.avatar}
                className="h-14 w-14"
              />
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAddStatus(true); }}
              className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-foreground">My Status</h3>
            <p className="text-sm text-muted-foreground">
              {myStatuses.length > 0 
                ? `Tap to view • ${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}`
                : 'Tap to add status update'
              }
            </p>
          </div>
        </button>
      </div>

      {/* Recent updates */}
      {recentStatuses.length > 0 && (
        <div className="mt-4">
          <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent updates
          </h4>
          <div className="divide-y divide-border">
            {recentStatuses.map(status => (
              <button
                key={status.id}
                onClick={() => handleStatusClick(status.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full p-0.5 bg-gradient-to-br from-primary to-whatsapp-teal">
                    <UserAvatar
                      name={status.userName}
                      avatar={status.userAvatar}
                      className="h-full w-full border-2 border-background"
                    />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">{status.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(status.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Viewed updates */}
      {viewedStatuses.length > 0 && (
        <div className="mt-4">
          <h4 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Viewed updates
          </h4>
          <div className="divide-y divide-border">
            {viewedStatuses.map(status => (
              <button
                key={status.id}
                onClick={() => handleStatusClick(status.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full p-0.5 bg-muted-foreground/30">
                    <UserAvatar
                      name={status.userName}
                      avatar={status.userAvatar}
                      className="h-full w-full border-2 border-background"
                    />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">{status.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(status.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {otherStatuses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Camera className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No status updates</p>
          <p className="text-sm">Status updates from your contacts will appear here</p>
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={() => setShowAddStatus(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-whatsapp-green-dark transition-colors"
      >
        <Camera className="h-6 w-6" />
      </button>

      {/* Add Status Modal */}
      {showAddStatus && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button
              onClick={() => setShowAddStatus(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-white font-semibold">Add Status</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {/* Status type selector */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setStatusType('media')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                  statusType === 'media' ? 'bg-primary text-white' : 'bg-white/10 text-white'
                )}
              >
                <div className="flex gap-1">
                  <ImageIcon className="h-6 w-6" />
                  <Video className="h-6 w-6" />
                </div>
                <span className="text-sm">Photo/Video</span>
              </button>
              <button
                onClick={() => setStatusType('text')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                  statusType === 'text' ? 'bg-primary text-white' : 'bg-white/10 text-white'
                )}
              >
                <Type className="h-8 w-8" />
                <span className="text-sm">Text</span>
              </button>
            </div>

            {statusType === 'media' ? (
              <button
                onClick={handleAddImageStatus}
                className="w-48 h-48 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-white/50 transition-colors"
              >
                <div className="flex gap-2">
                  <Camera className="h-10 w-10 text-white/70" />
                  <Video className="h-10 w-10 text-white/70" />
                </div>
                <span className="text-white/70">Select Photo or Video</span>
              </button>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <textarea
                  value={textStatus}
                  onChange={(e) => setTextStatus(e.target.value)}
                  placeholder="Type a status..."
                  className="w-full h-32 bg-white/10 text-white placeholder:text-white/50 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                />
                <div className="flex gap-2 justify-center">
                  {bgColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedBgColor(color)}
                      className={cn(
                        'h-8 w-8 rounded-full transition-transform',
                        selectedBgColor === color && 'ring-2 ring-white scale-110'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleAddTextStatus}
                  disabled={!textStatus.trim()}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-whatsapp-green-dark transition-colors"
                >
                  Share Status
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Status Viewer - Full Page */}
      {viewingStatus && viewingStatusData && (
        <div 
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={closeStatusViewer}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-10">
            <div className="h-full bg-white animate-status-progress" />
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeStatusViewer();
            }}
            className="absolute top-4 right-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center gap-3">
            <UserAvatar
              name={viewingStatusData.userName}
              avatar={viewingStatusData.userAvatar}
              className="h-10 w-10"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{viewingStatusData.userName}</h3>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(viewingStatusData.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          {viewingStatusData.type === 'text' ? (
            <div 
              className="flex-1 flex items-center justify-center p-8"
              style={{ backgroundColor: viewingStatusData.backgroundColor || '#25D366' }}
            >
              <p className="text-2xl text-white text-center font-medium">
                {viewingStatusData.caption}
              </p>
            </div>
          ) : viewingStatusData.type === 'video' && viewingStatusData.mediaUrl ? (
            <div className="flex-1 flex items-center justify-center bg-black">
              <video
                src={viewingStatusData.mediaUrl}
                autoPlay
                controls
                playsInline
                className="max-h-full max-w-full object-contain"
              />
              {viewingStatusData.caption && (
                <div className="absolute bottom-32 left-0 right-0 px-4 py-2 bg-black/50">
                  <p className="text-white text-center">{viewingStatusData.caption}</p>
                </div>
              )}
            </div>
          ) : viewingStatusData.mediaUrl ? (
            <div className="flex-1 flex items-center justify-center bg-black">
              <img
                src={viewingStatusData.mediaUrl}
                alt="Status"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {viewingStatusData.caption && (
                <div className="absolute bottom-32 left-0 right-0 px-4 py-2 bg-black/50">
                  <p className="text-white text-center">{viewingStatusData.caption}</p>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="flex-1 flex items-center justify-center p-8"
              style={{ backgroundColor: '#25D366' }}
            >
              <p className="text-xl text-white text-center">No media available</p>
            </div>
          )}

          {/* Seen count at bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                <Eye className="h-4 w-4" />
                <span>
                  Seen by {viewingStatusData.viewedBy.length} {viewingStatusData.viewedBy.length === 1 ? 'person' : 'people'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default StatusPage;
