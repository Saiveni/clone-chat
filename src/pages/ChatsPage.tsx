import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Search } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { chats, getContactForChat, setActiveChat, typingUsers, markAllAsRead } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

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

  const handleNewGroup = () => {
    setShowNewChatDialog(true);
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    toast.success('All chats marked as read');
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader 
        title="WhatsApp" 
        showCamera 
        onNewGroup={handleNewGroup}
        onReadAll={handleReadAll}
      />

      {/* Search bar */}
      <div className="px-4 py-3 md:py-2 bg-background sticky top-[56px] md:top-[52px] z-10 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-3 md:py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
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
      <button 
        onClick={() => setShowNewChatDialog(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 h-16 w-16 md:h-14 md:w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-whatsapp-green-dark transition-all active:scale-95 touch-manipulation z-40" 
        aria-label="New chat"
      >
        <MessageSquarePlus className="h-7 w-7 md:h-6 md:w-6" />
      </button>

      <NewChatDialog 
        open={showNewChatDialog} 
        onOpenChange={setShowNewChatDialog}
        onChatCreated={() => {
          // Could navigate to the new chat or just close
        }}
      />

      <BottomNav />
    </div>
  );
};

export default ChatsPage;
