import mongoose from 'mongoose';
import { Message, IMessage } from '../models/Message';
import { Chat } from '../models/Chat';

export interface SendMessageData {
  senderId: string;
  recipientId: string;
  text?: string;
  mediaId?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export interface MessageResponse {
  id: string;
  senderId: string;
  recipientId: string;
  content: {
    text?: string;
    mediaId?: string;
    mediaType?: string;
  };
  status: string;
  isEdited: boolean;
  createdAt: Date;
}

export class MessageService {
  /**
   * Send a direct message
   */
  async sendMessage(data: SendMessageData): Promise<MessageResponse> {
    // Validate message content
    if (!data.text?.trim() && !data.mediaId) {
      throw new Error('Message cannot be empty');
    }

    // Create message
    const message = await Message.create({
      senderId: new mongoose.Types.ObjectId(data.senderId),
      recipientId: new mongoose.Types.ObjectId(data.recipientId),
      content: {
        text: data.text?.trim(),
        mediaId: data.mediaId ? new mongoose.Types.ObjectId(data.mediaId) : undefined,
        mediaType: data.mediaType,
      },
      status: 'sent',
    });

    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [data.senderId, data.recipientId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [data.senderId, data.recipientId],
        lastMessage: message._id,
        lastMessageAt: message.createdAt,
      });
    } else {
      chat.lastMessage = message._id;
      chat.lastMessageAt = message.createdAt;
      await chat.save();
    }

    return this.formatMessage(message);
  }

  /**
   * Get messages between two users
   */
  async getMessages(
    userId: string,
    otherUserId: string,
    limit: number = 50,
    before?: string
  ): Promise<MessageResponse[]> {
    const query: any = {
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
      isDeleted: false,
      deletedFor: { $ne: userId },
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return messages.map(this.formatMessage).reverse();
  }

  /**
   * Get user's chats
   */
  async getChats(userId: string): Promise<any[]> {
    const chats = await Chat.find({
      participants: userId,
    })
      .populate('participants', 'displayName username profilePicture isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    return chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (p: any) => p._id.toString() !== userId
      );
      return {
        id: chat._id.toString(),
        user: otherParticipant,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
      };
    });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: string, senderId: string): Promise<void> {
    await Message.updateMany(
      {
        senderId: senderId,
        recipientId: userId,
        status: { $ne: 'read' },
      },
      { status: 'read' }
    );
  }

  /**
   * Mark messages as delivered
   */
  async markAsDelivered(userId: string, senderId: string): Promise<void> {
    await Message.updateMany(
      {
        senderId: senderId,
        recipientId: userId,
        status: 'sent',
      },
      { status: 'delivered' }
    );
  }

  /**
   * Edit message
   */
  async editMessage(
    messageId: string,
    userId: string,
    newText: string
  ): Promise<MessageResponse> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new Error('You can only edit your own messages');
    }

    // Check 48 hour limit
    const hoursDiff = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 48) {
      throw new Error('Cannot edit messages older than 48 hours');
    }

    message.content.text = newText.trim();
    message.isEdited = true;
    await message.save();

    return this.formatMessage(message);
  }

  /**
   * Delete message
   */
  async deleteMessage(
    messageId: string,
    userId: string,
    forEveryone: boolean
  ): Promise<void> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (forEveryone) {
      if (message.senderId.toString() !== userId) {
        throw new Error('You can only delete your own messages for everyone');
      }
      message.isDeleted = true;
      message.content.text = undefined;
    } else {
      message.deletedFor.push(new mongoose.Types.ObjectId(userId));
    }

    await message.save();
  }

  /**
   * Search messages
   */
  async searchMessages(
    userId: string,
    query: string,
    chatUserId?: string
  ): Promise<MessageResponse[]> {
    const searchQuery: any = {
      $or: [{ senderId: userId }, { recipientId: userId }],
      'content.text': { $regex: query, $options: 'i' },
      isDeleted: false,
      deletedFor: { $ne: userId },
    };

    if (chatUserId) {
      searchQuery.$or = [
        { senderId: userId, recipientId: chatUserId },
        { senderId: chatUserId, recipientId: userId },
      ];
    }

    const messages = await Message.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.map(this.formatMessage);
  }

  private formatMessage(message: IMessage): MessageResponse {
    return {
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      recipientId: message.recipientId?.toString() || '',
      content: {
        text: message.content.text,
        mediaId: message.content.mediaId?.toString(),
        mediaType: message.content.mediaType,
      },
      status: message.status,
      isEdited: message.isEdited,
      createdAt: message.createdAt,
    };
  }
}
