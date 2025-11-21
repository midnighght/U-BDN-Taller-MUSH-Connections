const API_BASE_URL = 'http://localhost:3000';

export const requests_api = {
  // ✅ Obtener solicitudes de amistad
  async getFriendRequests(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener solicitudes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // ✅ Obtener solicitudes de comunidad
  async getCommunityRequests(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/community/${communityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener solicitudes de comunidad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // ✅ Aceptar solicitud (genérico)
  async acceptRequest(requestId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/accept`, {
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

  // ✅ Rechazar solicitud (genérico)
  async rejectRequest(requestId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
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

  // ✅ Enviar solicitud de amistad
  async sendFriendRequest(recipientId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/friends/${recipientId}`, {
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

  // ✅ Solicitar unirse a comunidad
  async requestJoinCommunity(communityId: string, message: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/community/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Error al solicitar unirse a la comunidad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};