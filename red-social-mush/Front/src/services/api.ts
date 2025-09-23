const API_BASE_URL = 'http://localhost:3000';

export const api = {
  // 🔥 PRIMERO: Probar si el backend responde
  async testConnection() {
    try {
      console.log('🧪 Probando conexión con backend...');
      const response = await fetch(`${API_BASE_URL}/auth/test`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend responde:', data.message);
        return true;
      } else {
        console.log('❌ Backend no responde correctamente');
        return false;
      }
    } catch (error) {
      console.log('💥 Error de conexión:', error);
      return false;
    }
  },

  // 🔥 SEGUNDO: Hacer login (POST correcto)
  async login(email: string, password: string) {
    console.log('🔐 Preparando login para:', email);
    
    // Primero probar conexión
    const isConnected = await this.testConnection();
    if (!isConnected) {
      throw new Error('No se puede conectar al backend');
    }
    
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
  }
};