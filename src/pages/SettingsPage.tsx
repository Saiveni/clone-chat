import React, { useRef, useState } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  MessageCircle, 
  HelpCircle, 
  Info,
  ChevronRight,
  LogOut,
  Camera
} from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const settingsItems = [
  { icon: User, label: 'Account', description: 'Privacy, security, change number' },
  { icon: Bell, label: 'Notifications', description: 'Message, group & call tones' },
  { icon: Lock, label: 'Privacy', description: 'Block contacts, disappearing messages' },
  { icon: MessageCircle, label: 'Chats', description: 'Theme, wallpapers, chat history' },
  { icon: HelpCircle, label: 'Help', description: 'Help center, contact us, privacy policy' },
  { icon: Info, label: 'About', description: 'App info' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, user, firebaseUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        if (firebaseUser) {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            avatar: base64String,
          });
          toast.success('Profile picture updated successfully');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Settings" />

      {/* Profile section */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={user?.name || 'User'}
              className="h-20 w-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleAvatarClick}
            />
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background hover:bg-whatsapp-green-dark transition-colors disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user?.about || 'Hey there! I am using WhatsApp'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings items */}
      <div className="divide-y divide-border">
        {settingsItems.map(({ icon: Icon, label, description }) => (
          <button
            key={label}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-foreground">{label}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-destructive/10 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <span className="font-medium text-destructive">Log out</span>
        </button>
      </div>

      {/* App info */}
      <div className="py-8 text-center">
        <p className="text-xs text-muted-foreground">
          WhatsApp Clone v1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Built with ❤️ using React
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
