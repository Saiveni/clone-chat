import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';

const ChatPage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { chats, messages, getContactForChat, sendMessage, markAsRead, setActiveChat, typingUsers } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const contact = chat ? getContactForChat(chat) : undefined;
  const isTyping = chatId ? typingUsers[chatId] : false;

  useEffect(() => {
    if (chat) {
      setActiveChat(chat);
      markAsRead(chat.id);
    }
    return () => setActiveChat(null);
  }, [chat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleBack = () => {
    setActiveChat(null);
    navigate('/chats');
  };

  const handleSend = async (content: string, type: Message['type'] = 'text', file?: File) => {
    if (chatId) {
      await sendMessage(chatId, content, type, file);
    }
  };

  if (!chat || !contact) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: typeof messages }[] = [];
  let currentDateStr = '';

  messages.forEach(msg => {
    // Handle both Date objects and Firestore Timestamps
    const timestamp = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
    const msgDateStr = timestamp.toDateString();
    
    if (msgDateStr !== currentDateStr) {
      currentDateStr = msgDateStr;
      groupedMessages.push({ date: timestamp, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader contact={contact} onBack={handleBack} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-pattern">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {groupedMessages.map((group, groupIndex) => (
            <div key={group.date.toISOString() + groupIndex} className="space-y-2">
              {/* Date label */}
              <div className="flex justify-center">
                <span className="bg-card/90 backdrop-blur-sm text-muted-foreground text-xs px-3 py-1 rounded-lg shadow-sm">
                  {formatDateLabel(group.date)}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((msg, msgIndex) => {
                const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
                const showTail = !prevMsg || prevMsg.senderId !== msg.senderId;
                const isOwn = msg.senderId === user?.id;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    showTail={showTail}
                    isOwn={isOwn}
                  />
                );
              })}
            </div>
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatPage;
