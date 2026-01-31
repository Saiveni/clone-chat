import React, { useRef, useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Info, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/ui/UserAvatar';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        if (firebaseUser) {
          // Update in Firestore - avatar will update via real-time listener
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
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-header text-header-foreground px-4 py-3.5 md:py-3 flex items-center gap-3 shadow-sm sticky top-0 z-50">
        <button
          onClick={() => navigate('/settings')}
          className="p-2.5 md:p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6 md:h-5 md:w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Account</h1>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Profile Picture */}
        <div className="flex justify-center py-8">
          <div className="relative cursor-pointer" onClick={handleAvatarClick}>
            <UserAvatar
              name={user?.name || 'User'}
              avatar={user?.avatar}
              className="h-32 w-32 border-4 border-primary hover:opacity-80 transition-opacity"
            />
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-4 border-background hover:bg-whatsapp-green-dark transition-all active:scale-95 touch-manipulation disabled:opacity-50 shadow-lg"
              aria-label="Change profile picture"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-card mx-4 rounded-lg shadow-sm divide-y divide-border">
          <div className="p-4 flex items-center gap-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name || 'Not set'}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.id ? 'Registered' : 'Not set'}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user?.phone || 'Not set'}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">About</p>
              <p className="font-medium">{user?.about || 'Hey there! I am using WhatsApp'}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-4 mt-6">
          <p className="text-sm text-muted-foreground text-center">
            This information is visible to your contacts
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
