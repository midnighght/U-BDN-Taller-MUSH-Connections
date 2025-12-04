import type{ loginDTO,  registerDTO } from './dto/api.dto';
import { API_BASE_URL } from '../config/api.config';

export const api = {
 
  
  async login(email: string, password: string) {
    console.log('Preparando login para:', email);
    const credentials: loginDTO = { email:email, password:password };
    try {
      console.log('Enviando petición POST a /auth/login...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Respuesta recibida. Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Login exitoso. Datos recibidos:', data);
      return data;
      
    } catch (error: any) {
      console.log('Error en login:', error.message);
      throw new Error('Error o credenciales incorrectas' );
    }
  },

  async register(email: string, password: string, username: string, firstName: string, lastName: string, birthDate: string, location: string) {
  const credentials: registerDTO = { email: email, password: password, username:username, firstName:firstName, lastName:lastName, birthDate:birthDate, location:location };
  try {
    const result = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!result.ok) {
      const errorMessage = await result.text();
      throw new Error(`HTTP ${result.status}: ${errorMessage}`);
    }


  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw error;
  }
},

 async obtainUserData(token: string) {
    try {
      
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401) {
       
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('Respuesta vacía del servidor');
        return null;
      }

      const userData = JSON.parse(text);
      console.log('Datos del usuario obtenidos:', userData.communities);
      return userData;

    } catch (error: any) {
      console.error("Error al obtener los datos del usuario:", error);
      
      return null;
    }
  
},
//taggedUsers y Hashtags hay que separarlos. Deberia enviar el token o id del usuario?
  async updatePhoto(userPhoto : string, token: string){
    try {
        const response = await fetch(`${API_BASE_URL}/users/update-photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({userPhoto}),
      });
        if (response.ok){
          return true;
        }
      } catch (error) {
        console.error("Error al actualizar la descripcion del usuario:", error);
        return false;
      }
      return false;
      
  },

  async updateDescription(description:string, token:string): Promise <boolean>{

      try {
        const response = await fetch(`${API_BASE_URL}/users/update-bio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({description}),
      });
        if (response.ok){
          return true;
        }
      } catch (error) {
        console.error("Error al actualizar la descripcion del usuario:", error);
        return false;
      }
      return false;
  },
  
  async deleteAccount(token: string){
    try {
        const url = `${API_BASE_URL}/users/delete-account`;
       
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        
        console.log('Status:', response.status);
        
        if (response.ok){
          return true;
        } else {
          console.log('Error response:', await response.text());
        }
      } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        return false;
      }
      return false;
  },


  async updateAccountPrivacy(token:string, isPrivate: boolean) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
         body: JSON.stringify({ isPrivate }),
      });
        if (response.ok){
          return;
        }
      } catch (error) {
        console.error("Error al actualizar la descripcion del usuario:", error);
        return;
      }
      return ;

  }
};