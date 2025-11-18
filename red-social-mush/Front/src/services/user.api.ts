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

  // ✅ Enviar solicitud de amistad
  async sendFriendRequest(recipientId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/request/${recipientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // ✅ Aceptar solicitud de amistad
  async acceptFriendRequest(friendshipId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/accept/${friendshipId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al aceptar solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // ✅ Rechazar solicitud de amistad
  async rejectFriendRequest(friendshipId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/reject/${friendshipId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al rechazar solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // ✅ Eliminar amigo
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
        throw new Error('Error al eliminar amistad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
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