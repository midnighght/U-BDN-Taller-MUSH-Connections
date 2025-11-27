import type { CreateComunityDTO } from "./dto/communities.api.dto";
import { API_BASE_URL } from '../config/api.config';

export const communities_api = {
  async createComunity(name: string, description: string, hashtags: string, image: string, token: string) {
    const noSpacesHashtags = hashtags.replace(/\s/g, "");
    const splitHashtag = noSpacesHashtags.split("#");
    splitHashtag.splice(0, 1);
    const comunityData: CreateComunityDTO = {
      name: name,
      description: description,
      hashtags: splitHashtag,
      image: image,
      token: token
    }
    try {
      const response = await fetch(`${API_BASE_URL}/communities/createComunity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(comunityData),
      });
      if (response.ok) {
        console.log('Comunidad Creada');
      }
    } catch (error) {
      console.log("Error al crear la comunidad:", error);
    }
  },

  async getMyCommunitiesDetailed(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/my-communities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener comunidades');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  },

  async leaveCommunity(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/leaveCommunity`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ communityId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al salir de la comunidad');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al salir de comunidad:', error);
      throw error;
    }
  },


  async getCommunityById(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener la comunidad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching community:', error);
      throw error;
    }
  },

  async getCommunityPosts(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener posts de la comunidad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  },

 async joinCommunity(communityId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al unirse' }));
      throw new Error(errorData.message || 'Error al unirse a la comunidad');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error joining community:', error);
    throw error;
  }
},


async requestJoin(communityId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/request-join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al solicitar' }));
      throw new Error(errorData.message || 'Error al solicitar unirse');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error requesting to join:', error);
    throw error;
  }
},


  async getPendingRequests(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/pending-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener solicitudes pendientes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },


  async acceptRequest(communityId: string, userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/accept-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al aceptar solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  },


  async rejectRequest(communityId: string, userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al rechazar solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },


  async removeMember(communityId: string, userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/remove-member`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar miembro');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  },

  
  async promoteToAdmin(communityId: string, userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/promote-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al ascender a admin');
      }

      return await response.json();
    } catch (error) {
      console.error('Error promoting to admin:', error);
      throw error;
    }
  },


  async demoteFromAdmin(communityId: string, userId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/demote-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al degradar admin');
      }

      return await response.json();
    } catch (error) {
      console.error('Error demoting admin:', error);
      throw error;
    }
  },

  async transferOwnership(communityId: string, newOwnerId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/transfer-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newOwnerId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al transferir propiedad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw error;
    }
  },

  async deleteCommunity(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar comunidad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  },

  async getCommunityMembers(communityId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener miembros');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

async updateCommunityPhoto(communityId: string, imageBase64: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/photo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image: imageBase64 })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar foto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating community photo:', error);
    throw error;
  }
},

async updateCommunityDescription(communityId: string, description: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/description`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar descripción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating community description:', error);
    throw error;
  }
},


async updateCommunityHashtags(communityId: string, hashtags: string[], token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/hashtags`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ hashtags })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar hashtags');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating community hashtags:', error);
    throw error;
  }
},


async updateCommunityPrivacy(communityId: string, isPrivate: boolean, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/privacy`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isPrivate })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar privacidad');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating community privacy:', error);
    throw error;
  }
}
};