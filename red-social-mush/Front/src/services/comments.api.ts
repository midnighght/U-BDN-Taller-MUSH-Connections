import { API_BASE_URL } from '../config/api.config';

export const comments_api = {
  async getCommentsByPost(postId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener comentarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async createComment(postId: string, textBody: string, token: string, parentCommentID?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ textBody, parentCommentID })
      });

      if (!response.ok) {
        throw new Error('Error al crear comentario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar comentario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async updateComment(commentId: string, textBody: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ textBody })
      });

      if (!response.ok) {
        throw new Error('Error al editar comentario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};