const API_BASE_URL = 'http://localhost:3000';

export const requests_api = {
  // Obtener solicitudes de amistad recibidas
  async getFriendRequests(token: string) {
    const response = await fetch(`${API_BASE_URL}/requests/friends`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al obtener solicitudes');
    }

    return await response.json();
  },

  // Aceptar solicitud
  async acceptRequest(requestId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al aceptar solicitud');
    }

    return await response.json();
  },

  // Rechazar solicitud
  async rejectRequest(requestId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al rechazar solicitud');
    }

    return await response.json();
  },

  // Enviar solicitud de amistad
  async sendFriendRequest(recipientId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/requests/friends/${recipientId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al enviar solicitud');
    }

    return await response.json();
  },

  // Obtener solicitudes de comunidad
  async getCommunityRequests(communityId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/requests/community/${communityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al obtener solicitudes');
    }

    return await response.json();
  },

  // Solicitar unirse a comunidad
  async requestJoinCommunity(communityId: string, message: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/requests/community/${communityId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al solicitar unirse');
    }

    return await response.json();
  },
  // Cancelar solicitud enviada
async cancelRequest(requestId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/requests/${requestId}/cancel`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al cancelar solicitud');
  }

  return await response.json();
}
};