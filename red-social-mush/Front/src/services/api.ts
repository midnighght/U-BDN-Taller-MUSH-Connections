const API_BASE_URL = 'http://localhost:3000';

export const api = {
 
  // 🔥 SEGUNDO: Hacer login (POST correcto)
  async login(email: string, password: string) {
    console.log('🔐 Preparando login para:', email);
  
    try {
      console.log('📨 Enviando petición POST a /auth/login...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', // ← IMPORTANTE: POST no GET
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),
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
  try {
    const result = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: username, 
        email: email, 
        password: password,
      }),
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
}
};