import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  getDocs,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Status } from '@/types/chat';

interface StatusContextType {
  statuses: Status[];
  myStatuses: Status[];
  recentStatuses: Status[];
  viewedStatuses: Status[];
  addStatus: (file: File | null, caption: string, type: 'image' | 'video' | 'text', backgroundColor?: string) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;
  markStatusAsViewed: (statusId: string) => Promise<void>;
  getStatusViewers: (statusId: string) => string[];
  isLoading: boolean;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all statuses from the last 24 hours
  useEffect(() => {
    if (!user) {
      setStatuses([]);
      setIsLoading(false);
      return;
    }

    const statusesRef = collection(db, 'statuses');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const q = query(
      statusesRef,
      where('timestamp', '>=', twentyFourHoursAgo),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedStatuses: Status[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedStatuses.push({
          id: doc.id,
          userId: data.userId,
          mediaUrl: data.mediaUrl || '',
          caption: data.caption,
          timestamp: data.timestamp?.toDate() || new Date(),
          viewedBy: data.viewedBy || [],
          type: data.type || 'image',
          backgroundColor: data.backgroundColor,
          userName: data.userName,
          userAvatar: data.userAvatar,
        });
      });
      setStatuses(loadedStatuses);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const myStatuses = statuses.filter(s => s.userId === user?.id);
  
  const recentStatuses = statuses.filter(s => 
    s.userId !== user?.id && !s.viewedBy.includes(user?.id || '')
  );
  
  const viewedStatuses = statuses.filter(s => 
    s.userId !== user?.id && s.viewedBy.includes(user?.id || '')
  );

  const addStatus = async (file: File | null, caption: string, type: 'image' | 'video' | 'text', backgroundColor?: string) => {
    if (!user) return;

    let mediaUrl = '';

    if (file && (type === 'image' || type === 'video')) {
      const storageRef = ref(storage, `statuses/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      mediaUrl = await getDownloadURL(storageRef);
    }

    const statusesRef = collection(db, 'statuses');
    await addDoc(statusesRef, {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      mediaUrl,
      caption,
      type,
      backgroundColor: backgroundColor || '#128C7E',
      timestamp: serverTimestamp(),
      viewedBy: [],
    });
  };

  const deleteStatus = async (statusId: string) => {
    if (!user) return;

    const status = statuses.find(s => s.id === statusId);
    if (!status || status.userId !== user.id) return;

    // Delete media from storage if exists
    if (status.mediaUrl) {
      try {
        const storageRef = ref(storage, status.mediaUrl);
        await deleteObject(storageRef);
      } catch (error) {
        console.log('Error deleting media:', error);
      }
    }

    // Delete status document
    await deleteDoc(doc(db, 'statuses', statusId));
  };

  const markStatusAsViewed = async (statusId: string) => {
    if (!user) return;

    const statusRef = doc(db, 'statuses', statusId);
    await updateDoc(statusRef, {
      viewedBy: arrayUnion(user.id),
    });
  };

  const getStatusViewers = (statusId: string): string[] => {
    const status = statuses.find(s => s.id === statusId);
    return status?.viewedBy || [];
  };

  return (
    <StatusContext.Provider
      value={{
        statuses,
        myStatuses,
        recentStatuses,
        viewedStatuses,
        addStatus,
        deleteStatus,
        markStatusAsViewed,
        getStatusViewers,
        isLoading,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};
