import type{ loginDTO,  registerDTO } from './dto/api.dto';
const API_BASE_URL = 'http://localhost:3000';

export const api = {
 
  
  async login(email: string, password: string) {
    console.log('🔐 Preparando login para:', email);
    const credentials: loginDTO = { email:email, password:password };
    try {
      console.log('📨 Enviando petición POST a /auth/login...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', // ← IMPORTANTE: POST no GET
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Respuesta recibida. Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎉 Login exitoso. Datos recibidos:', data);
      return data;
      
    } catch (error: any) {
      console.log('💥 Error en login:', error.message);
      throw new Error('Error en login: ' + error.message);
    }
  },

  async register(email: string, password: string, username: string) {
  const credentials: registerDTO = { email: email, password: password, username:username };
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

    // Handle successful response

  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw error;
  }
},

 async obtainUserData(token: string) {
    try {
      console.log('👤 Obteniendo datos del usuario...');
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      // Si el token es inválido o expiró
      if (response.status === 401) {
        console.warn('⚠️ Token inválido o expirado');
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Verificar que hay contenido antes de parsear
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('⚠️ Respuesta vacía del servidor');
        return null;
      }

      const userData = JSON.parse(text);
      console.log('✅ Datos del usuario obtenidos:', userData);
      return userData;

    } catch (error: any) {
      console.error("❌ Error al obtener los datos del usuario:", error);
      // IMPORTANTE: Retornar null en lugar de no retornar nada
      return null;
    }
  
},
//taggedUsers y Hashtags hay que separarlos. Deberia enviar el token o id del usuario?
  async updatePhoto(userPhoto : String, token: String){
    try {
        const response = await fetch(`${API_BASE_URL}/users/update-bio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userPhoto),
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

  async updateDescription(description:String, token:String): Promise <Boolean>{
      try {
        const response = await fetch(`${API_BASE_URL}/users/update-bio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(description),
      });
        if (response.ok){
          return true;
        }
      } catch (error) {
        console.error("Error al actualizar la descripcion del usuario:", error);
        return false;
      }
      return false;
  }
  
};