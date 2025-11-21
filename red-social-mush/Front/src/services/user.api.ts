import { friendships_api } from './friendships.api';

const API_BASE_URL = 'http://localhost:3000';

export const user_api = {
  // ✅ Ver perfil de otro usuario
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

  // NEW: Obtener posts de un usuario (respetar privacidad en backend)
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
        // si el backend devuelve 403 por privacidad el cliente lo maneja
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error al obtener posts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // ✅ Enviar solicitud de amistad (usa friendships_api)
  async sendFriendRequest(recipientId: string, token: string) {
    return await friendships_api.sendFriendRequest(recipientId, token);
  },

  // ✅ Aceptar solicitud de amistad (usa friendships_api)
  async acceptFriendRequest(friendshipId: string, token: string) {
    return await friendships_api.acceptFriendRequest(friendshipId, token);
  },

  // ✅ Rechazar solicitud de amistad (usa friendships_api)
  async rejectFriendRequest(friendshipId: string, token: string) {
    return await friendships_api.rejectFriendRequest(friendshipId, token);
  },

  // ✅ Eliminar amigo (usa friendships_api)
  async removeFriend(friendId: string, token: string) {
    return await friendships_api.removeFriend(friendId, token);
  },

  // ✅ Bloquear usuario
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

  // ✅ Desbloquear usuario
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