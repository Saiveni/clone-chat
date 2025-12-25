import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

export const UserAvatar = ({ 
  name, 
  avatar, 
  className = 'h-12 w-12', 
  showOnlineStatus = false,
  isOnline = false 
}: UserAvatarProps) => {
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const isBase64Image = avatar && avatar.startsWith('data:image');

  return (
    <div className="relative flex-shrink-0">
      {isBase64Image ? (
        <img
          src={avatar}
          alt={name}
          className={cn('rounded-full object-cover', className)}
        />
      ) : (
        <div 
          className={cn(
            'rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-lg',
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {showOnlineStatus && isOnline && (
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-background" />
      )}
    </div>
  );
};
