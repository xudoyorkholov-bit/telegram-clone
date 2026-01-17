import api from './auth';

export interface ChatParticipant {
  id: string;
  displayName: string;
  username?: string;
  profilePicture?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatLastMessage {
  id: string;
  text?: string;
  senderId: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participant: ChatParticipant;
  lastMessage?: ChatLastMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  // Create new chat
  createChat: async (participantId: string): Promise<{ success: boolean; data: Chat }> => {
    const response = await api.post('/chats/create', { participantId });
    return response.data;
  },

  // Get my chats
  getMyChats: async (): Promise<{ success: boolean; data: Chat[] }> => {
    const response = await api.get('/chats/my');
    return response.data;
  },

  // Get chat by ID
  getChatById: async (chatId: string): Promise<{ success: boolean; data: Chat }> => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  // Get chat with user
  getChatWithUser: async (userId: string): Promise<{ success: boolean; data: Chat | null }> => {
    const response = await api.get(`/chats/user/${userId}`);
    return response.data;
  },

  // Delete chat
  deleteChat: async (chatId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },
};
