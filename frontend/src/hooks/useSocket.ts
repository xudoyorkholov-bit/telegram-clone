import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export interface SocketMessage {
  id?: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  sendMessage: (recipientId: string, text: string, mediaId?: string, mediaType?: string) => void;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
  markAsRead: (senderId: string) => void;
  markAsSeen: (senderId: string) => void;
}

interface SocketCallbacks {
  onNewMessage?: (message: SocketMessage) => void;
  onTypingStart?: (userId: string) => void;
  onTypingStop?: (userId: string) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string, lastSeen: Date) => void;
  onMessageRead?: (readerId: string) => void;
  onMessageDelivered?: (messageId: string, recipientId: string) => void;
  onMessageSeen?: (readerId: string, senderId: string) => void;
}

export function useSocket(callbacks?: SocketCallbacks): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef<SocketCallbacks | undefined>(callbacks);
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    console.log('useSocket: Auth check', { 
      isAuthenticated, 
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      tokenStart: accessToken?.substring(0, 10) + '...'
    });
    
    // Disconnect existing socket first
    if (socketRef.current) {
      console.log('useSocket: Disconnecting existing socket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
    
    if (!isAuthenticated || !accessToken) {
      console.log('useSocket: Not authenticated, skipping socket connection');
      return;
    }

    console.log('useSocket: Connecting to socket...', SOCKET_URL);

    // Connect to socket
    socketRef.current = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true, // Force new connection
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🚫 Socket connection error:', error.message);
      console.error('🚫 Token being used:', accessToken?.substring(0, 20) + '...');
      setIsConnected(false);
    });

    socket.on('message:new', (message: SocketMessage) => {
      console.log('Socket received message:new', message);
      callbacksRef.current?.onNewMessage?.(message);
    });

    socket.on('typing:start', ({ userId }: { userId: string }) => {
      callbacksRef.current?.onTypingStart?.(userId);
    });

    socket.on('typing:stop', ({ userId }: { userId: string }) => {
      callbacksRef.current?.onTypingStop?.(userId);
    });

    socket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
      callbacksRef.current?.onUserOnline?.(userId);
    });

    socket.on('user:offline', ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      callbacksRef.current?.onUserOffline?.(userId, new Date(lastSeen));
    });

    socket.on('message:read', ({ readerId }: { readerId: string }) => {
      callbacksRef.current?.onMessageRead?.(readerId);
    });

    socket.on('message:delivered', ({ messageId, recipientId }: { messageId: string; recipientId: string }) => {
      callbacksRef.current?.onMessageDelivered?.(messageId, recipientId);
    });

    socket.on('message:seen', ({ readerId, senderId }: { readerId: string; senderId: string }) => {
      callbacksRef.current?.onMessageSeen?.(readerId, senderId);
    });

    return () => {
      socket.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated, accessToken]);

  const sendMessage = useCallback((recipientId: string, text: string, mediaId?: string, mediaType?: string) => {
    socketRef.current?.emit('message:send', { recipientId, text, mediaId, mediaType }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        console.error('Failed to send message:', response.error);
      }
    });
  }, []);

  const startTyping = useCallback((recipientId: string) => {
    console.log('🔤 Starting typing to:', recipientId);
    socketRef.current?.emit('typing:start', { recipientId });
  }, []);

  const stopTyping = useCallback((recipientId: string) => {
    console.log('⏹️ Stopping typing to:', recipientId);
    socketRef.current?.emit('typing:stop', { recipientId });
  }, []);

  const markAsRead = useCallback((senderId: string) => {
    socketRef.current?.emit('message:read', { senderId });
  }, []);

  const markAsSeen = useCallback((senderId: string) => {
    socketRef.current?.emit('message:seen', { senderId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    markAsSeen,
  };
}
