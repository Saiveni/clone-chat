import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Chat, Message, Contact } from '@/types/chat';
import { chats as initialChats, messages as initialMessages, contacts, currentUser, getChatParticipant } from '@/data/mockData';

interface ChatContextType {
  chats: Chat[];
  messages: Record<string, Message[]>;
  contacts: Contact[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => void;
  markAsRead: (chatId: string) => void;
  getContactForChat: (chat: Chat) => Contact | undefined;
  typingUsers: Record<string, boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const sendMessage = (chatId: string, content: string, type: Message['type'] = 'text') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      content,
      type,
      timestamp: new Date(),
      status: 'sending',
    };

    // Add message to messages
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    // Update chat's last message and move to top
    setChats(prev => {
      const chatIndex = prev.findIndex(c => c.id === chatId);
      if (chatIndex === -1) return prev;

      const updatedChat = {
        ...prev[chatIndex],
        lastMessage: newMessage,
        updatedAt: new Date(),
      };

      const newChats = [...prev];
      newChats.splice(chatIndex, 1);
      return [updatedChat, ...newChats];
    });

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ),
      }));
    }, 500);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
    }, 1000);

    // Simulate typing and reply
    const contact = getChatParticipant(chats.find(c => c.id === chatId)!);
    if (contact?.isOnline) {
      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [chatId]: true }));
      }, 1500);

      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [chatId]: false }));
        
        const replyMessage: Message = {
          id: `msg-${Date.now()}-reply`,
          chatId,
          senderId: contact.id,
          content: getAutoReply(content),
          type: 'text',
          timestamp: new Date(),
          status: 'read',
        };

        setMessages(prev => ({
          ...prev,
          [chatId]: [...prev[chatId], replyMessage],
        }));

        setChats(prev => {
          const chatIndex = prev.findIndex(c => c.id === chatId);
          if (chatIndex === -1) return prev;

          const updatedChat = {
            ...prev[chatIndex],
            lastMessage: replyMessage,
            updatedAt: new Date(),
            unreadCount: activeChat?.id === chatId ? 0 : prev[chatIndex].unreadCount + 1,
          };

          const newChats = [...prev];
          newChats.splice(chatIndex, 1);
          return [updatedChat, ...newChats];
        });
      }, 3500);
    }
  };

  const markAsRead = (chatId: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );

    // Mark all messages as read
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg => ({ ...msg, status: 'read' as const })) || [],
    }));
  };

  const getContactForChat = (chat: Chat): Contact | undefined => {
    return getChatParticipant(chat);
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

// Auto-reply helper
const autoReplies = [
  "That's great! 😊",
  "Sounds good to me!",
  "I'll get back to you on that.",
  "Thanks for letting me know!",
  "Absolutely!",
  "Let me think about it.",
  "Perfect! 👍",
  "Okay, got it!",
];

const getAutoReply = (message: string): string => {
  if (message.includes('?')) {
    return "Let me think about that and get back to you!";
  }
  return autoReplies[Math.floor(Math.random() * autoReplies.length)];
};
