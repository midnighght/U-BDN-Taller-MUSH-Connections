import { requests_api } from './requests.api';
import { API_BASE_URL } from '../config/api.config';

export const user_api = {
  async getUserProfile(userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async getUserPosts(userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error('Error al obtener posts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async sendFriendRequest(recipientId: string, token: string) {
    return await requests_api.sendFriendRequest(recipientId, token);
  },

  async acceptFriendRequest(requestId: string, token: string) {
    return await requests_api.acceptRequest(requestId, token);
  },

  async rejectFriendRequest(requestId: string, token: string) {
    return await requests_api.rejectRequest(requestId, token);
  },

  async removeFriend(friendId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/remove/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error('Error al eliminar amigo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async blockUser(userId: string, token: string, reason?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/blocks/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Error al bloquear usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async unblockUser(userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/blocks/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al desbloquear usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};