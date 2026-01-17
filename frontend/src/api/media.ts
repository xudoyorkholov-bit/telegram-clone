import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface MediaUploadResponse {
  success: boolean;
  data: {
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    mediaType: 'image' | 'video';
    url: string;
  };
}

export const mediaApi = {
  /**
   * Upload an image or video file
   */
  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Upload an image file (backward compatibility)
   */
  async uploadImage(file: File): Promise<MediaUploadResponse> {
    return this.uploadMedia(file);
  },

  /**
   * Get media URL
   */
  getMediaUrl(mediaId: string): string {
    return `${API_URL}/media/${mediaId}`;
  },

  /**
   * Delete uploaded media
   */
  async deleteMedia(mediaId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/media/${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Delete failed');
    }

    return response.json();
  },
};