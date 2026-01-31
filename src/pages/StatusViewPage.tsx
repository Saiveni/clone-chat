import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Eye, X, MoreVertical, Play, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStatus } from '@/context/StatusContext';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

const StatusViewPage = () => {
  const navigate = useNavigate();
  const { statusId } = useParams<{ statusId: string }>();
  const { statuses, markStatusAsViewed, getStatusViewers, deleteStatus, myStatuses } = useStatus();
  const { user } = useAuth();
  const { contacts } = useChat();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Find the status and related statuses from the same user
  const currentStatus = statuses.find(s => s.id === statusId);
  const userStatuses = currentStatus 
    ? statuses.filter(s => s.userId === currentStatus.userId).sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];
  
  const isMyStatus = currentStatus?.userId === user?.id;
  const activeStatus = userStatuses[currentIndex] || currentStatus;

  // Mark status as viewed
  useEffect(() => {
    if (activeStatus && !isMyStatus) {
      markStatusAsViewed(activeStatus.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus?.id, isMyStatus]);

  // Progress timer
  useEffect(() => {
    if (!activeStatus || isPaused) return;

    const duration = activeStatus.type === 'video' ? 30000 : 5000; // 30s for video, 5s for images/text
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next status
          if (currentIndex < userStatuses.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return 0;
          } else {
            navigate(-1);
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStatus, isPaused, currentIndex, userStatuses.length, navigate]);

  // Reset progress when changing status
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < userStatuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      navigate(-1);
    }
  };

  const handleDelete = async () => {
    if (activeStatus && isMyStatus) {
      await deleteStatus(activeStatus.id);
      if (userStatuses.length <= 1) {
        navigate(-1);
      } else if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
    setShowMenu(false);
  };

  const getViewerInfo = (viewerId: string) => {
    const contact = contacts.find(c => c.id === viewerId);
    return contact || { name: 'Unknown User', avatar: '' };
  };

  const viewers = activeStatus ? getStatusViewers(activeStatus.id) : [];

  if (!activeStatus) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-white">Status not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col relative">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
        {userStatuses.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ 
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <img
            src={activeStatus.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStatus.userId}`}
            alt="User"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-white">
              {isMyStatus ? 'My Status' : activeStatus.userName || 'User'}
            </h3>
            <p className="text-xs text-white/70">
              {formatDistanceToNow(activeStatus.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeStatus.type === 'video' && (
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isPaused ? (
                <Play className="h-5 w-5 text-white" />
              ) : (
                <Pause className="h-5 w-5 text-white" />
              )}
            </button>
          )}
          {isMyStatus && (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-white" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-card rounded-lg shadow-lg py-2 min-w-[150px]">
                  <button 
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-destructive hover:bg-secondary/50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 flex items-center justify-center"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) {
            handlePrevious();
          } else if (x > (rect.width * 2) / 3) {
            handleNext();
          } else {
            setIsPaused(!isPaused);
          }
        }}
      >
        {activeStatus.type === 'text' ? (
          <div 
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor: activeStatus.backgroundColor || '#128C7E' }}
          >
            <p className="text-2xl md:text-4xl text-white text-center font-medium max-w-2xl">
              {activeStatus.caption}
            </p>
          </div>
        ) : activeStatus.type === 'video' ? (
          <video
            ref={videoRef}
            src={activeStatus.mediaUrl}
            className="max-h-full max-w-full object-contain"
            autoPlay
            loop={false}
            muted={false}
            playsInline
            onPause={() => setIsPaused(true)}
            onPlay={() => setIsPaused(false)}
          />
        ) : (
          <img
            src={activeStatus.mediaUrl}
            alt="Status"
            className="max-h-full max-w-full object-contain"
          />
        )}
        
        {activeStatus.type !== 'text' && activeStatus.caption && (
          <div className="absolute bottom-24 left-0 right-0 px-4 py-3 bg-black/50">
            <p className="text-white text-center">{activeStatus.caption}</p>
          </div>
        )}
      </div>

      {/* Viewers (only for own statuses) */}
      {isMyStatus && (
        <button
          onClick={() => setShowViewers(true)}
          className="absolute bottom-4 left-4 right-4 py-3 bg-black/50 rounded-lg flex items-center justify-center gap-2 text-white"
        >
          <Eye className="h-5 w-5" />
          <span>{viewers.length} view{viewers.length !== 1 ? 's' : ''}</span>
        </button>
      )}

      {/* Viewers Modal */}
      {showViewers && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
          <div className="bg-card w-full max-w-lg rounded-t-2xl max-h-[70vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Viewed by</h3>
              <button 
                onClick={() => setShowViewers(false)}
                className="p-2 hover:bg-secondary rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {viewers.length > 0 ? (
                viewers.map(viewerId => {
                  const viewer = getViewerInfo(viewerId);
                  return (
                    <div key={viewerId} className="flex items-center gap-3 p-4 border-b border-border">
                      <img
                        src={viewer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewerId}`}
                        alt={viewer.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <span className="font-medium text-foreground">{viewer.name}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No views yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusViewPage;
