const API_BASE_URL = 'http://localhost:3000';

export const friendships_api = {
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
  },

  // ✅ Obtener amigos con límite (para HomePage)
  async getFriendsLimited(token: string, limit: number = 5) {
    try {
      console.log(`👥 Obteniendo ${limit} amigos...`);
      
      const response = await fetch(`${API_BASE_URL}/friendships/friends/search?limit=${limit}`, {
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
      console.log('✅ Amigos limitados recibidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener amigos limitados:', error);
      throw error;
    }
  },

  // ✅ Buscar amigos
  async searchFriends(token: string, search: string) {
    try {
      console.log('🔍 Buscando amigos:', search);
      
      const response = await fetch(
        `${API_BASE_URL}/friendships/friends/search?search=${encodeURIComponent(search)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al buscar amigos');
      }

      const data = await response.json();
      console.log('✅ Búsqueda completada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      throw error;
    }
  }
};