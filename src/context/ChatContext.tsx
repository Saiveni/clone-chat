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
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Chat, Message, Contact } from '@/types/chat';

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  contacts: Contact[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => Promise<void>;
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

  const sendMessage = async (chatId: string, content: string, type: Message['type'] = 'text') => {
    if (!user) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    // Add message
    const messageDoc = await addDoc(messagesRef, {
      senderId: user.id,
      content,
      type,
      timestamp: serverTimestamp(),
      status: 'sent',
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
        content,
        type,
        timestamp: serverTimestamp(),
        status: 'sent',
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
