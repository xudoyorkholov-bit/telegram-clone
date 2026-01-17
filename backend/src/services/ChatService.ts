import mongoose from 'mongoose';
import { Chat, IChat } from '../models/Chat';
import { User } from '../models/User';
import { Message } from '../models/Message';

export interface ChatResponse {
  id: string;
  participant: {
    id: string;
    displayName: string;
    username?: string;
    profilePicture?: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
  lastMessage?: {
    id: string;
    text?: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatService {
  /**
   * Create or get existing chat between two users
   */
  async createChat(userId: string, participantId: string): Promise<ChatResponse> {
    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      throw new Error('User not found');
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [userId, participantId],
      });
    }

    return this.formatChat(chat, userId);
  }

  /**
   * Get all chats for a user
   */
  async getMyChats(userId: string): Promise<ChatResponse[]> {
    const chats = await Chat.find({
      participants: userId,
    })
      .populate('lastMessage')
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const formattedChats = await Promise.all(
      chats.map((chat) => this.formatChat(chat, userId))
    );

    return formattedChats;
  }

  /**
   * Get single chat by ID
   */
  async getChatById(chatId: string, userId: string): Promise<ChatResponse | null> {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    }).populate('lastMessage');

    if (!chat) {
      return null;
    }

    return this.formatChat(chat, userId);
  }

  /**
   * Get chat by participant
   */
  async getChatByParticipant(userId: string, participantId: string): Promise<ChatResponse | null> {
    const chat = await Chat.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    }).populate('lastMessage');

    if (!chat) {
      return null;
    }

    return this.formatChat(chat, userId);
  }

  /**
   * Delete chat
   */
  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Delete all messages in chat
    const otherParticipant = chat.participants.find(
      (p) => p.toString() !== userId
    );

    if (otherParticipant) {
      await Message.updateMany(
        {
          $or: [
            { senderId: userId, recipientId: otherParticipant },
            { senderId: otherParticipant, recipientId: userId },
          ],
        },
        { $addToSet: { deletedFor: userId } }
      );
    }

    // Remove user from chat participants or delete chat
    if (chat.participants.length <= 2) {
      await Chat.findByIdAndDelete(chatId);
    }
  }

  /**
   * Format chat for response
   */
  private async formatChat(chat: IChat, userId: string): Promise<ChatResponse> {
    // Get other participant
    const otherParticipantId = chat.participants.find(
      (p) => p.toString() !== userId
    );

    const participant = await User.findById(otherParticipantId);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      senderId: otherParticipantId,
      recipientId: userId,
      status: { $ne: 'read' },
    });

    const lastMessage = chat.lastMessage as any;

    return {
      id: chat._id.toString(),
      participant: {
        id: participant?._id.toString() || '',
        displayName: participant?.displayName || 'Unknown',
        username: participant?.username,
        profilePicture: participant?.profilePicture,
        isOnline: participant?.isOnline || false,
        lastSeen: participant?.lastSeen,
      },
      lastMessage: lastMessage
        ? {
            id: lastMessage._id.toString(),
            text: lastMessage.content?.text,
            senderId: lastMessage.senderId.toString(),
            createdAt: lastMessage.createdAt,
          }
        : undefined,
      unreadCount,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}
