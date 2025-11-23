// services/suggestions.api.ts
const API_BASE_URL = 'http://localhost:3000';

export const suggestions_api = {
  /**
   * Obtener sugerencias de amigos
   */
  async getFriendSuggestions(token: string, limit: number = 10) {
    try {
      console.log('💡 Obteniendo sugerencias de amigos...');
      
      const response = await fetch(
        `${API_BASE_URL}/suggestions/friends?limit=${limit}`,
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
        throw new Error(error.message || 'Error al obtener sugerencias');
      }

      const data = await response.json();
      console.log('✅ Sugerencias recibidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener sugerencias:', error);
      throw error;
    }
  }
};