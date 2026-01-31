import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { chats, getContactForChat, setActiveChat, typingUsers, messages } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'contacts' | 'messages'>('contacts');

  // Filter chats by contact name
  const filteredChats = chats.filter(chat => {
    const contact = getContactForChat(chat);
    if (!contact) return false;
    if (!searchQuery) return true;
    
    if (searchType === 'contacts') {
      return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      // Search in messages
      return contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const handleChatClick = (chat: typeof chats[0]) => {
    setActiveChat(chat);
    navigate(`/chat/${chat.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Custom header with back button for desktop */}
      <header className="bg-header text-header-foreground px-4 py-3 flex items-center gap-3 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors hidden lg:flex"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">WhatsApp</h1>
      </header>

      {/* Search bar */}
      <div className="px-4 py-2 bg-background sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats and messages"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {searchQuery && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setSearchType('contacts')}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                searchType === 'contacts' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Contacts
            </button>
            <button
              onClick={() => setSearchType('messages')}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                searchType === 'messages' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Messages
            </button>
          </div>
        )}
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
                searchQuery={searchQuery}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {searchQuery ? 'No results found' : 'No chats yet'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search' : 'Start a new conversation from Contacts'}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatsPage;
