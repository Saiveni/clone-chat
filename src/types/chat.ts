export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  about: string;
  lastSeen: Date;
  isOnline: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'document' | 'video' | 'audio';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // for voice messages
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  groupName?: string;
  groupAvatar?: string;
  createdAt?: Date;
  updatedAt: Date;
}

export interface Status {
  id: string;
  userId: string;
  mediaUrl: string;
  caption?: string;
  timestamp: Date;
  viewedBy: string[];
  type: 'image' | 'video' | 'text';
  backgroundColor?: string;
  userName?: string;
  userAvatar?: string;
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'voice' | 'video';
  status: 'missed' | 'answered' | 'outgoing';
  duration?: number;
  timestamp: Date;
}

export interface Contact extends User {
  chatId?: string;
}
