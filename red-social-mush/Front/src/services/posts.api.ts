const API_BASE_URL = 'http://localhost:3000';

export const posts_api = {
  async createPost(
    image: File, 
    description: string, 
    taggedUsers: string, 
    hashtags: string, 
    token: string
  ): Promise<boolean> {
    try {
      // Procesar taggedUsers
      const noSpacesTaggedUsers = taggedUsers.replace(/\s/g, "");
      const splitTaggedUser = noSpacesTaggedUsers.split(',').filter(tag => tag !== '');

      // Procesar hashtags
      const noSpacesHashtags = hashtags.replace(/\s/g, "");
      const splitHashtag = noSpacesHashtags.split("#").filter(tag => tag !== '');

      // ✅ CREAR FORMDATA (NO DTO)
      const formData = new FormData();
      formData.append('image', image); // Archivo
      formData.append('description', description);
      formData.append('taggedUsers', splitTaggedUser.join(',')); // Array → string
      formData.append('hashtags', splitHashtag.join(',')); // Array → string

      const response = await fetch(`${API_BASE_URL}/posts/createPost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // ✅ NO INCLUIR 'Content-Type' - FormData lo maneja
        },
        body: formData, // ✅ FORMDATA (no DTO)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Post creado:', data);
        return true;
      }
      
      const errorData = await response.json();
      console.error('❌ Error:', errorData);
      return false;
    } catch (error) {
      console.error("❌ Error al crear el post:", error);
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
  }
};