const API_BASE_URL = 'http://localhost:3000';

export const friendships_api = {
  // ✅ Obtener solicitudes pendientes
  async getPendingRequests(token: string) {
    try {
      console.log('📥 Obteniendo solicitudes pendientes...');
      
      const response = await fetch(`${API_BASE_URL}/friendships/requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener solicitudes');
      }

      const data = await response.json();
      console.log('✅ Solicitudes recibidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  },

  // ✅ Aceptar solicitud
  async acceptFriendRequest(friendshipId: string, token: string) {
    try {
      console.log('✅ Aceptando solicitud:', friendshipId);
      
      const response = await fetch(`${API_BASE_URL}/friendships/accept/${friendshipId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al aceptar solicitud');
      }

      const data = await response.json();
      console.log('✅ Solicitud aceptada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al aceptar:', error);
      throw error;
    }
  },

  // ✅ Rechazar solicitud
  async rejectFriendRequest(friendshipId: string, token: string) {
    try {
      console.log('❌ Rechazando solicitud:', friendshipId);
      
      const response = await fetch(`${API_BASE_URL}/friendships/reject/${friendshipId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al rechazar solicitud');
      }

      const data = await response.json();
      console.log('✅ Solicitud rechazada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al rechazar:', error);
      throw error;
    }
  },

  // ✅ Enviar solicitud de amistad
  async sendFriendRequest(recipientId: string, token: string) {
    try {
      console.log('📤 Enviando solicitud a:', recipientId);
      
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

      const data = await response.json();
      console.log('✅ Solicitud enviada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al enviar solicitud:', error);
      throw error;
    }
  },

  // ✅ Eliminar amigo
  async removeFriend(friendId: string, token: string) {
    try {
      console.log('🗑️ Eliminando amigo:', friendId);
      
      const response = await fetch(`${API_BASE_URL}/friendships/remove/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar amigo');
      }

      const data = await response.json();
      console.log('✅ Amigo eliminado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al eliminar amigo:', error);
      throw error;
    }
  },

  // ✅ Obtener lista de amigos
  async getFriends(token: string) {
    try {
      console.log('👥 Obteniendo lista de amigos...');
      
      const response = await fetch(`${API_BASE_URL}/friendships/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener amigos');
      }

      const data = await response.json();
      console.log('✅ Amigos recibidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener amigos:', error);
      throw error;
    }
  },

  // ✅ Verificar estado de amistad con otro usuario
  async getFriendshipStatus(otherUserId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/friendships/status/${otherUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al verificar estado');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al verificar estado:', error);
      throw error;
    }
  }
};