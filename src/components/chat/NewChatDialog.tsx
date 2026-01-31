import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated?: () => void;
}

export const NewChatDialog = ({ open, onOpenChange, onChatCreated }: NewChatDialogProps) => {
  const { user: currentUser } = useAuth();
  const { createOrGetChat } = useChat();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      loadUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers: User[] = [];
      usersSnapshot.forEach((doc) => {
        if (doc.id !== currentUser?.id) {
          allUsers.push({
            id: doc.id,
            name: doc.data().name,
            avatar: doc.data().avatar,
            email: doc.data().email,
          });
        }
      });
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (isCreatingGroup && selectedUsers.length === 1) {
      toast.error('Groups require at least 2 members');
      return;
    }

    if (isCreatingGroup && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      if (isCreatingGroup) {
        // Group chats not yet supported, create individual chat with first selected user
        toast.info('Group chats coming soon! Creating individual chat instead.');
        await createOrGetChat(selectedUsers[0]);
      } else {
        // Create individual chat
        await createOrGetChat(selectedUsers[0]);
        toast.success('Chat created successfully');
      }
      
      // Reset and close
      setSelectedUsers([]);
      setGroupName('');
      setIsCreatingGroup(false);
      onOpenChange(false);
      onChatCreated?.();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreatingGroup ? 'Create Group' : 'New Chat'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isCreatingGroup && (
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-base"
            />
          )}

          <div className="flex gap-2">
            <Button
              variant={isCreatingGroup ? 'outline' : 'default'}
              onClick={() => {
                setIsCreatingGroup(false);
                setSelectedUsers(prev => prev.slice(0, 1));
              }}
              className="flex-1"
            >
              Individual Chat
            </Button>
            <Button
              variant={isCreatingGroup ? 'default' : 'outline'}
              onClick={() => setIsCreatingGroup(true)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Group Chat
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {isCreatingGroup 
              ? `Selected: ${selectedUsers.length} member${selectedUsers.length !== 1 ? 's' : ''}`
              : selectedUsers.length > 0 
                ? '1 user selected'
                : 'Select a user'}
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {users.map((user) => {
                  const isSelected = selectedUsers.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (!isCreatingGroup) {
                          setSelectedUsers([user.id]);
                        } else {
                          toggleUserSelection(user.id);
                        }
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors',
                        isSelected && 'bg-primary/10'
                      )}
                    >
                      <UserAvatar
                        name={user.name}
                        avatar={user.avatar}
                        className="h-12 w-12"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length === 0}
              className="flex-1"
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
