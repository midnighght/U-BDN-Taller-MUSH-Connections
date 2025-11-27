import { API_BASE_URL } from '../config/api.config';

  export const posts_api = {
    async createPost(
  image: File, 
  description: string, 
  taggedUsers: string, 
  hashtags: string, 
  token: string,
  communityId?: string 
): Promise<boolean> {
  try {
    const noSpacesTaggedUsers = taggedUsers.replace(/\s/g, "");
    const splitTaggedUser = noSpacesTaggedUsers.split(',').filter(tag => tag !== '');

    const noSpacesHashtags = hashtags.replace(/\s/g, "");
    const splitHashtag = noSpacesHashtags.split("#").filter(tag => tag !== '');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);
    formData.append('taggedUsers', splitTaggedUser.join(',')); 
    formData.append('hashtags', splitHashtag.join(',')); 
    
    if (communityId) {
      formData.append('communityId', communityId);
    }

    const response = await fetch(`${API_BASE_URL}/posts/createPost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData, 
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Post creado:', data);
      return true;
    }
    
    const errorData = await response.json();
    console.error('Error:', errorData);
    return false;
  } catch (error) {
    console.error("Error al crear el post");
    return false;
  }
},

    async obtainUserPosts(token: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/userPosts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          return typeof data === 'string' ? JSON.parse(data) : data;
        }

        throw new Error('Failed to fetch user posts');
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },

    async getPostById(postId: string, token: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener el post');
        }

        return await response.json();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },

    async toggleLike(postId: string, token: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al dar like');
        }

        return await response.json();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },

    async toggleDislike(postId: string, token: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislike`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al dar dislike');
        }

        return await response.json();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },

    async deletePost(postId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Error al eliminar el post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar post:', error);
    throw error;
  }
},

async deletePostAsAdmin(communityId: string, postId: string, token: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/communities/${communityId}/posts/${postId}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Error al eliminar el post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar post');
    throw error;
  }
}
  };