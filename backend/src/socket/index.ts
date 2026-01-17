import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { MessageService } from '../services/MessageService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Store online users: { oderId: socketId }
const onlineUsers = new Map<string, string>();
const messageService = new MessageService();

export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('🔐 Socket auth attempt, token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

      if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as { userId: string };

      console.log('✅ Token decoded, userId:', decoded.userId);

      const user = await User.findById(decoded.userId);

      if (!user) {
        console.log('❌ User not found for ID:', decoded.userId);
        return next(new Error('User not found'));
      }

      console.log('✅ User found:', user.displayName);
      socket.userId = user._id.toString();
      next();
    } catch (error: any) {
      console.log('❌ Socket auth error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User connected: ${userId}`);

    // Store socket connection
    onlineUsers.set(userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Notify contacts about online status
    socket.broadcast.emit('user:online', { userId });

    // Join personal room
    socket.join(userId);

    // Handle sending messages
    socket.on('message:send', async (data, callback) => {
      try {
        const { recipientId, text, mediaId, mediaType } = data;
        console.log(`Message from ${userId} to ${recipientId}:`, text ? `"${text}"` : `[${mediaType}]`);

        // Save message to database
        const savedMessage = await messageService.sendMessage({
          senderId: userId,
          recipientId,
          text,
          mediaId,
          mediaType,
        });

        console.log('Message saved:', savedMessage.id);

        // Emit to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        console.log(`Recipient ${recipientId} socket: ${recipientSocketId || 'offline'}`);
        console.log('Online users:', Array.from(onlineUsers.entries()));
        
        if (recipientSocketId) {
          // Mark as delivered when recipient is online
          await messageService.markAsDelivered(recipientId, userId);
          
          io.to(recipientSocketId).emit('message:new', {
            id: savedMessage.id,
            senderId: userId,
            recipientId,
            text: savedMessage.content.text,
            mediaId: savedMessage.content.mediaId,
            mediaType: savedMessage.content.mediaType,
            createdAt: savedMessage.createdAt,
          });
          
          // Notify sender about delivery
          socket.emit('message:delivered', {
            messageId: savedMessage.id,
            recipientId
          });
          
          console.log('Message emitted to recipient and marked as delivered');
        }

        callback({ success: true, message: savedMessage });
      } catch (error: any) {
        console.error('Message send error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:start', { userId });
      }
    });

    socket.on('typing:stop', (data) => {
      const { recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:stop', { userId });
      }
    });

    // Handle message read
    socket.on('message:read', async (data) => {
      const { senderId } = data;
      
      // Mark messages as read in database
      await messageService.markAsRead(userId, senderId);
      
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read', { readerId: userId });
      }
    });

    // Handle message seen (when user opens chat)
    socket.on('message:seen', async (data) => {
      const { senderId } = data;
      
      // Mark messages as read in database
      await messageService.markAsRead(userId, senderId);
      
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:seen', { 
          readerId: userId,
          senderId: senderId
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);

      // Update user offline status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Notify contacts about offline status
      socket.broadcast.emit('user:offline', {
        userId,
        lastSeen: new Date(),
      });
    });
  });

  return io;
}

export { onlineUsers };
