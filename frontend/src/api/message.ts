import api from './auth';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: {
    text?: string;
    mediaId?: string;
    mediaType?: string;
  };
  status: 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  createdAt: string;
}

export interface ChatItem {
  id: string;
  user: {
    _id: string;
    displayName: string;
    username?: string;
    profilePicture?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage?: Message;
  lastMessageAt?: string;
}

export const messageApi = {
  // Send message
  sendMessage: async (
    recipientId: string,
    text: string
  ): Promise<{ success: boolean; data: Message }> => {
    const response = await api.post('/messages', { recipientId, text });
    return response.data;
  },

  // Get messages with user
  getMessages: async (
    userId: string,
    limit?: number,
    before?: string
  ): Promise<{ success: boolean; data: Message[] }> => {
    const response = await api.get(`/messages/${userId}`, {
      params: { limit, before },
    });
    return response.data;
  },

  // Get chat list
  getChats: async (): Promise<{ success: boolean; data: ChatItem[] }> => {
    const response = await api.get('/messages/chats/list');
    return response.data;
  },

  // Edit message
  editMessage: async (
    messageId: string,
    text: string
  ): Promise<{ success: boolean; data: Message }> => {
    const response = await api.put(`/messages/${messageId}`, { text });
    return response.data;
  },

  // Delete message
  deleteMessage: async (
    messageId: string,
    forEveryone: boolean = false
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(`/messages/${messageId}`, {
      params: { forEveryone },
    });
    return response.data;
  },

  // Mark as read
  markAsRead: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/messages/${userId}/read`);
    return response.data;
  },

  // Search messages
  searchMessages: async (
    query: string,
    chatUserId?: string
  ): Promise<{ success: boolean; data: Message[] }> => {
    const response = await api.get('/messages/search/query', {
      params: { q: query, chatUserId },
    });
    return response.data;
  },
};
