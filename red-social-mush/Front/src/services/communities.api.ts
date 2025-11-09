import  type { CreateComunityDTO } from "./dto/communities.api.dto";
const API_BASE_URL = 'http://localhost:3000';
export const communities_api = {
    async createComunity(name: String, description: String, hashtags: String, image:String, token: string){
        const noSpacesHashtags = hashtags.replace(/\s/g, "");
        const splitHashtag = noSpacesHashtags.split("#");
        splitHashtag.splice(0,1);
        const comunityData: CreateComunityDTO = {
            name: name,
            description: description,
            hashtags: splitHashtag,
            image: image,
            token: token
        }
        try {
    const response =  await fetch(`${API_BASE_URL}/communities/createComunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(comunityData
      ),
    });
    if (response.ok){
      console.log('Comunidad Creada');
    } 
  }catch (error) {
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
    }
}