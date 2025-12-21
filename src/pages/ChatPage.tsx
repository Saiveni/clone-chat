import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

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

  const handleSend = async (content: string, type: 'text' | 'image' | 'document' = 'text', mediaUrl?: string) => {
    if (chatId) {
      await sendMessage(chatId, content, type, mediaUrl);
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
  const groupedMessages: { date: string; messages: typeof messages }[] = [];
  let currentDate = '';

  messages.forEach(msg => {
    const msgDate = new Date(msg.timestamp).toLocaleDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader contact={contact} onBack={handleBack} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-pattern">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {groupedMessages.map((group) => (
            <div key={group.date} className="space-y-2">
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
