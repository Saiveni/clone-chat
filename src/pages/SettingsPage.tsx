import React from 'react';
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
import { currentUser } from '@/data/mockData';

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
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MainHeader title="Settings" />

      {/* Profile section */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-20 w-20 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {currentUser.name}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {currentUser.about}
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
