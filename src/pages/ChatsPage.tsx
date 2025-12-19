import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Search } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { chats, getContactForChat, setActiveChat, typingUsers } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredChats = chats.filter(chat => {
    const contact = getContactForChat(chat);
    if (!contact) return false;
    if (!searchQuery) return true;
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleChatClick = (chat: typeof chats[0]) => {
    setActiveChat(chat);
    navigate(`/chat/${chat.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="WhatsApp" showCamera />

      {/* Search bar */}
      <div className="px-4 py-2 bg-background sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="divide-y divide-border">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => {
            const contact = getContactForChat(chat);
            return (
              <ChatListItem
                key={chat.id}
                chat={chat}
                contact={contact}
                isActive={false}
                onClick={() => handleChatClick(chat)}
                isTyping={typingUsers[chat.id]}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <MessageSquarePlus className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No chats found</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-4 lg:bottom-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-whatsapp-green-dark transition-colors">
        <MessageSquarePlus className="h-6 w-6" />
      </button>

      <BottomNav />
    </div>
  );
};

export default ChatsPage;
