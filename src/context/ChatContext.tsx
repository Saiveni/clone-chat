import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Chat, Message, Contact } from '@/types/chat';

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  contacts: Contact[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type'], file?: File) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  getContactForChat: (chat: Chat) => Contact | undefined;
  typingUsers: Record<string, boolean>;
  createOrGetChat: (contactId: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Load all users as contacts
  useEffect(() => {
    if (!user) return;

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const loadedContacts: Contact[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.id) {
          const data = doc.data();
          loadedContacts.push({
            id: doc.id,
            name: data.name || 'Unknown',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`,
            phone: data.phone || '',
            about: data.about || 'Hey there! I am using WhatsApp',
            lastSeen: data.lastSeen?.toDate() || new Date(),
            isOnline: data.isOnline || false,
          });
        }
      });
      setContacts(loadedContacts);
    });

    return () => unsubscribe();
  }, [user]);

  // Load chats for current user
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChats: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedChats.push({
          id: doc.id,
          type: data.type || 'individual',
          participants: data.participants || [],
          lastMessage: data.lastMessage ? {
            id: data.lastMessage.id,
            chatId: doc.id,
            senderId: data.lastMessage.senderId,
            content: data.lastMessage.content,
            type: data.lastMessage.type || 'text',
            timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
            status: data.lastMessage.status || 'sent',
            mediaUrl: data.lastMessage.mediaUrl,
            fileName: data.lastMessage.fileName,
          } : undefined,
          unreadCount: data.unreadCounts?.[user.id] || 0,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      setChats(loadedChats);
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages for active chat
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          chatId: activeChat.id,
          senderId: data.senderId,
          content: data.content,
          type: data.type || 'text',
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status || 'sent',
          mediaUrl: data.mediaUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
        });
      });
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [activeChat]);

  const createOrGetChat = async (contactId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.id)
    );
    
    const snapshot = await getDocs(q);
    let existingChatId: string | null = null;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(contactId) && data.participants.length === 2) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) return existingChatId;

    // Create new chat
    const newChatRef = await addDoc(chatsRef, {
      type: 'individual',
      participants: [user.id, contactId],
      unreadCounts: { [user.id]: 0, [contactId]: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newChatRef.id;
  };

  const sendMessage = async (chatId: string, content: string, type: Message['type'] = 'text', file?: File) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    let mediaUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Upload file if provided
    if (file && type !== 'text') {
      try {
        console.log('Uploading file:', file.name, 'Type:', type);
        const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        console.log('Upload successful:', uploadResult);
        mediaUrl = await getDownloadURL(storageRef);
        console.log('Media URL:', mediaUrl);
        fileName = file.name;
        fileSize = file.size;
      } catch (uploadError: any) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
    }

    // Determine display content
    const displayContent = type === 'text' ? content : 
      type === 'image' ? (content || '📷 Photo') :
      type === 'video' ? (content || '🎥 Video') :
      type === 'audio' ? (content || '🎵 Audio') :
      type === 'document' ? (content || `📄 ${fileName}`) :
      content || 'Media';

    // Add message
    const messageDoc = await addDoc(messagesRef, {
      senderId: user.id,
      content: displayContent,
      type,
      timestamp: serverTimestamp(),
      status: 'sent',
      mediaUrl,
      fileName,
      fileSize,
    });

    // Get chat to find other participant
    const chatSnap = await getDoc(chatRef);
    const chatData = chatSnap.data();
    const otherParticipant = chatData?.participants.find((p: string) => p !== user.id);

    // Update chat's last message and unread count
    await updateDoc(chatRef, {
      lastMessage: {
        id: messageDoc.id,
        senderId: user.id,
        content: displayContent,
        type,
        timestamp: serverTimestamp(),
        status: 'sent',
        mediaUrl,
        fileName,
      },
      [`unreadCounts.${otherParticipant}`]: (chatData?.unreadCounts?.[otherParticipant] || 0) + 1,
      updatedAt: serverTimestamp(),
    });
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCounts.${user.id}`]: 0,
    });
  };

  const getContactForChat = (chat: Chat): Contact | undefined => {
    if (!user) return undefined;
    const otherParticipantId = chat.participants.find(p => p !== user.id);
    return contacts.find(c => c.id === otherParticipantId);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        contacts,
        activeChat,
        setActiveChat,
        sendMessage,
        markAsRead,
        getContactForChat,
        typingUsers,
        createOrGetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
