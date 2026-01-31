import React, { useState, useRef } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  MessageCircle, 
  HelpCircle, 
  Info,
  ChevronRight,
  LogOut,
  Camera,
  ArrowLeft,
  Moon,
  Sun,
  Image,
  Trash2,
  Download,
  Key,
  Clock,
  UserX,
  X,
  Check,
  CheckCheck
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { cn } from '@/lib/utils';

type SettingsSection = 'main' | 'account' | 'notifications' | 'privacy' | 'chats' | 'help' | 'about' | 'profile';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, user, firebaseUser } = useAuth();
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [isUploading, setIsUploading] = useState(false);
  
  // Profile editing state
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [newAbout, setNewAbout] = useState(user?.about || '');
  
  // Settings state
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${firebaseUser.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('Upload successful:', uploadResult);
      
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadUrl);
      
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        avatar: downloadUrl,
      });
      
      alert('Profile picture updated successfully!');
      // Avatar will update automatically via real-time listener
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      alert(`Failed to upload profile picture: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!firebaseUser || !newName.trim()) return;
    
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        name: newName.trim(),
      });
      setEditingName(false);
      // Name will update automatically via real-time listener
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const handleUpdateAbout = async () => {
    if (!firebaseUser) return;
    
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        about: newAbout.trim() || 'Hey there! I am using WhatsApp',
      });
      setEditingAbout(false);
      // About will update automatically via real-time listener
    } catch (error) {
      console.error('Error updating about:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const renderMainSettings = () => (
    <>
      <button 
        onClick={() => setCurrentSection('profile')}
        className="w-full px-4 py-4 border-b border-border"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={user?.name || 'User'}
              className="h-20 w-20 rounded-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user?.about || 'Hey there! I am using WhatsApp'}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      <div className="divide-y divide-border">
        {[
          { icon: User, label: 'Account', description: 'Privacy, security, change number', section: 'account' as SettingsSection },
          { icon: Bell, label: 'Notifications', description: 'Message, group & call tones', section: 'notifications' as SettingsSection },
          { icon: Lock, label: 'Privacy', description: 'Block contacts, disappearing messages', section: 'privacy' as SettingsSection },
          { icon: MessageCircle, label: 'Chats', description: 'Theme, wallpapers, chat history', section: 'chats' as SettingsSection },
          { icon: HelpCircle, label: 'Help', description: 'Help center, contact us, privacy policy', section: 'help' as SettingsSection },
          { icon: Info, label: 'About', description: 'App info', section: 'about' as SettingsSection },
        ].map(({ icon: Icon, label, description, section }) => (
          <button
            key={label}
            onClick={() => setCurrentSection(section)}
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

      <div className="py-8 text-center">
        <p className="text-xs text-muted-foreground">WhatsApp Clone v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">Built with ❤️ using React</p>
      </div>
    </>
  );

  const renderProfileSection = () => (
    <div className="animate-slide-in">
      <div className="py-8 flex flex-col items-center">
        <div className="relative">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={user?.name || 'User'}
            className="h-32 w-32 rounded-full object-cover"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-4 border-background"
          >
            <Camera className="h-5 w-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
        </div>
      </div>

      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-primary">Name</span>
          {editingName ? (
            <div className="flex gap-2">
              <button onClick={() => setEditingName(false)} className="p-1 hover:bg-secondary rounded"><X className="h-4 w-4" /></button>
              <button onClick={handleUpdateName} className="p-1 hover:bg-secondary rounded text-primary"><Check className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="text-sm text-primary">Edit</button>
          )}
        </div>
        {editingName ? (
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-transparent border-b border-primary outline-none py-1 text-foreground" autoFocus />
        ) : (
          <p className="text-foreground">{user?.name || 'User'}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">This is not your username or pin. This name will be visible to your WhatsApp contacts.</p>
      </div>

      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-primary">About</span>
          {editingAbout ? (
            <div className="flex gap-2">
              <button onClick={() => setEditingAbout(false)} className="p-1 hover:bg-secondary rounded"><X className="h-4 w-4" /></button>
              <button onClick={handleUpdateAbout} className="p-1 hover:bg-secondary rounded text-primary"><Check className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => setEditingAbout(true)} className="text-sm text-primary">Edit</button>
          )}
        </div>
        {editingAbout ? (
          <input type="text" value={newAbout} onChange={(e) => setNewAbout(e.target.value)} className="w-full bg-transparent border-b border-primary outline-none py-1 text-foreground" autoFocus />
        ) : (
          <p className="text-foreground">{user?.about || 'Hey there! I am using WhatsApp'}</p>
        )}
      </div>

      <div className="px-4 py-4 border-b border-border">
        <span className="text-sm text-primary">Phone</span>
        <p className="text-foreground mt-1">{user?.phone || 'Not set'}</p>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="divide-y divide-border animate-slide-in">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h3 className="font-medium text-foreground">Message notifications</h3>
          <p className="text-sm text-muted-foreground">Show notifications for new messages</p>
        </div>
        <button onClick={() => setMessageNotifications(!messageNotifications)} className={cn("w-12 h-6 rounded-full transition-colors", messageNotifications ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", messageNotifications ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h3 className="font-medium text-foreground">Group notifications</h3>
          <p className="text-sm text-muted-foreground">Show notifications for groups</p>
        </div>
        <button onClick={() => setGroupNotifications(!groupNotifications)} className={cn("w-12 h-6 rounded-full transition-colors", groupNotifications ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", groupNotifications ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="divide-y divide-border animate-slide-in">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div><h3 className="font-medium text-foreground">Last seen</h3><p className="text-sm text-muted-foreground">Who can see when you were last online</p></div>
        </div>
        <button onClick={() => setShowLastSeen(!showLastSeen)} className={cn("w-12 h-6 rounded-full transition-colors", showLastSeen ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", showLastSeen ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div><h3 className="font-medium text-foreground">Profile photo</h3><p className="text-sm text-muted-foreground">Who can see your profile photo</p></div>
        </div>
        <button onClick={() => setShowProfilePhoto(!showProfilePhoto)} className={cn("w-12 h-6 rounded-full transition-colors", showProfilePhoto ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", showProfilePhoto ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-muted-foreground" />
          <div><h3 className="font-medium text-foreground">About</h3><p className="text-sm text-muted-foreground">Who can see your about</p></div>
        </div>
        <button onClick={() => setShowAbout(!showAbout)} className={cn("w-12 h-6 rounded-full transition-colors", showAbout ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", showAbout ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <CheckCheck className="h-5 w-5 text-muted-foreground" />
          <div><h3 className="font-medium text-foreground">Read receipts</h3><p className="text-sm text-muted-foreground">Show when you've read messages</p></div>
        </div>
        <button onClick={() => setReadReceipts(!readReceipts)} className={cn("w-12 h-6 rounded-full transition-colors", readReceipts ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", readReceipts ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <UserX className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Blocked contacts</h3><p className="text-sm text-muted-foreground">0 contacts</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );

  const renderChatsSection = () => (
    <div className="divide-y divide-border animate-slide-in">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {darkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
          <div><h3 className="font-medium text-foreground">Theme</h3><p className="text-sm text-muted-foreground">{darkMode ? 'Dark mode' : 'Light mode'}</p></div>
        </div>
        <button onClick={toggleDarkMode} className={cn("w-12 h-6 rounded-full transition-colors", darkMode ? "bg-primary" : "bg-muted")}>
          <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", darkMode ? "translate-x-6" : "translate-x-0.5")} />
        </button>
      </div>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <Image className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Wallpaper</h3><p className="text-sm text-muted-foreground">Change chat wallpaper</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <Download className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Chat backup</h3><p className="text-sm text-muted-foreground">Back up your chats</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-destructive/10 transition-colors">
        <Trash2 className="h-5 w-5 text-destructive" />
        <div className="flex-1 text-left"><h3 className="font-medium text-destructive">Delete all chats</h3><p className="text-sm text-muted-foreground">This will delete all your chat history</p></div>
      </button>
    </div>
  );

  const renderAccountSection = () => (
    <div className="divide-y divide-border animate-slide-in">
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Security</h3><p className="text-sm text-muted-foreground">Security notifications</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <Key className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Two-step verification</h3><p className="text-sm text-muted-foreground">Add extra security to your account</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <User className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Change number</h3><p className="text-sm text-muted-foreground">Change your registered phone number</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-destructive/10 transition-colors">
        <Trash2 className="h-5 w-5 text-destructive" />
        <div className="flex-1 text-left"><h3 className="font-medium text-destructive">Delete my account</h3><p className="text-sm text-muted-foreground">Permanently delete your account</p></div>
      </button>
    </div>
  );

  const renderHelpSection = () => (
    <div className="divide-y divide-border animate-slide-in">
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Help center</h3><p className="text-sm text-muted-foreground">Get help with WhatsApp</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Contact us</h3><p className="text-sm text-muted-foreground">Send us a message</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1 text-left"><h3 className="font-medium text-foreground">Privacy policy</h3><p className="text-sm text-muted-foreground">Read our privacy policy</p></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );

  const renderAboutSection = () => (
    <div className="animate-slide-in">
      <div className="py-12 flex flex-col items-center">
        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mb-4">
          <MessageCircle className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">WhatsApp Clone</h2>
        <p className="text-muted-foreground">Version 1.0.0</p>
      </div>
      <div className="divide-y divide-border">
        <div className="px-4 py-4">
          <h3 className="font-medium text-foreground">About</h3>
          <p className="text-sm text-muted-foreground mt-1">This is a WhatsApp clone built with React, TypeScript, Tailwind CSS, and Firebase.</p>
        </div>
        <div className="px-4 py-4">
          <h3 className="font-medium text-foreground">Technologies Used</h3>
          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
            <li>• React 18</li>
            <li>• TypeScript</li>
            <li>• Tailwind CSS</li>
            <li>• Firebase (Auth, Firestore, Storage)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'profile': return 'Profile';
      case 'account': return 'Account';
      case 'notifications': return 'Notifications';
      case 'privacy': return 'Privacy';
      case 'chats': return 'Chats';
      case 'help': return 'Help';
      case 'about': return 'About';
      default: return 'Settings';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-header text-header-foreground px-4 py-3 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        {currentSection !== 'main' && (
          <button onClick={() => setCurrentSection('main')} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-bold">{getSectionTitle()}</h1>
      </header>

      {currentSection === 'main' && renderMainSettings()}
      {currentSection === 'profile' && renderProfileSection()}
      {currentSection === 'account' && renderAccountSection()}
      {currentSection === 'notifications' && renderNotificationsSection()}
      {currentSection === 'privacy' && renderPrivacySection()}
      {currentSection === 'chats' && renderChatsSection()}
      {currentSection === 'help' && renderHelpSection()}
      {currentSection === 'about' && renderAboutSection()}

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
