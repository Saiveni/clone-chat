import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ContactsPage = () => {
  const navigate = useNavigate();
  const { contacts, createOrGetChat } = useChat();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContactId, setLoadingContactId] = useState<string | null>(null);

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    return (
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleContactClick = async (contactId: string) => {
    if (!user) return;
    
    setLoadingContactId(contactId);
    try {
      const chatId = await createOrGetChat(contactId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoadingContactId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Contacts" />

      {/* Search bar */}
      <div className="px-4 py-2 bg-background sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Contacts list */}
      <div className="divide-y divide-border">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => handleContactClick(contact.id)}
              disabled={loadingContactId === contact.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors disabled:opacity-50"
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground truncate">
                    {contact.name}
                  </h3>
                  {loadingContactId === contact.id && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {contact.isOnline ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    `Last seen ${formatLastSeen(contact.lastSeen)}`
                  )}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <UserPlus className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No contacts found</p>
            <p className="text-sm">
              {contacts.length === 0 
                ? 'No other users have signed up yet' 
                : 'Try a different search'}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ContactsPage;
