import { API_BASE_URL } from '../config/api.config';

export const requests_api = {
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
      throw new Error('Error al obtener solicitudes');
    }

    return await response.json();
  },

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
      throw new Error('Error al aceptar solicitud');
    }

    return await response.json();
  },

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
      throw new Error('Error al rechazar solicitud');
    }

    return await response.json();
  },

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
      throw new Error('Error al enviar solicitud');
    }

    return await response.json();
  },

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
      throw new Error('Error al obtener solicitudes');
    }

    return await response.json();
  },

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
      throw new Error('Error al solicitar unirse');
    }

    return await response.json();
  },
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
    throw new Error('Error al cancelar solicitud');
  }

  return await response.json();
}
};