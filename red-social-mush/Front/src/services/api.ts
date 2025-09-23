const API_BASE_URL = 'http://localhost:3000';

export const api = {
  async testConnection() {
    console.log('🧪 Probando conexión básica...');
    try {
      const response = await fetch(API_BASE_URL);
      console.log('✅ Backend responde. Status:', response.status);
      return true;
    } catch (error) {
      console.log('❌ No se puede conectar al backend:', error);
      return false;
    }
  },

  async login(email: string, password: string) {
    console.log('🔐 Iniciando login...');
    
    // Primero probamos la conexión básica
    const isConnected = await this.testConnection();
    if (!isConnected) {
      throw new Error('El backend no está accesible. Verifica que esté ejecutándose.');
    }
    
    try {
      console.log('📨 Enviando datos de login...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Status de respuesta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎉 Login exitoso. Datos:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.log('❌ Error del backend:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      console.log('💥 Error de conexión:', error.message);
      throw new Error('Error de red: ' + error.message);
    }
  }
};