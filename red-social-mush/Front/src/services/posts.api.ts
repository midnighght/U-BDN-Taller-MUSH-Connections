import type { CreatePostDTO } from "./dto/posts.api.dto.ts";  
const API_BASE_URL = 'http://localhost:3000';

export const posts_api = {
async createPost(image:String, description: String, taggedUsers: String, hashtags: String, token: string
  ): Promise<Boolean> {
  //Metodo para separar los taggedUsers y hashtags
  const noSpacesTaggedUsers = taggedUsers.replace(/\s/g, "");
  const splitTaggedUser = noSpacesTaggedUsers.split(',');

  const noSpacesHashtags = hashtags.replace(/\s/g, "");
  const splitHashtag = noSpacesHashtags.split("#");
  splitHashtag.splice(0,1);


  const postData: CreatePostDTO = {
        image: image, 
        description: description, 
        taggedUsers: splitTaggedUser,
        hashtags: splitHashtag,
  }
  try {
    const response =  await fetch(`${API_BASE_URL}/posts/createPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData
      ),
    });
    if (response.ok){
      return response.ok;
    } 
  }catch (error) {
    console.log("Error al crear el post:", error);
  }
  return false;
  },

   async  obtainUserPosts(token:string) {
    
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
      return data;
    }

    throw new Error('Failed to fetch user posts');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
};