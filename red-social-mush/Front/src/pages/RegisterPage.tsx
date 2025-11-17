import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error del campo cuando el usuario escribe
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseñas
    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar fecha de nacimiento (debe ser mayor de 13 años)
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      newErrors.birthDate = 'Debes tener al menos 13 años';
    }

    // Validar campos requeridos
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.username.trim()) newErrors.username = 'El usuario es requerido';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  console.log('Intentando registro con:', formData);
  const result = await register(
    formData.email,
    formData.password,
    formData.username,
    formData.firstName,
    formData.lastName,
    formData.birthDate,
    formData.location
  );

  if (result.success) {
    // ✅ MENSAJE MÁS CLARO
    alert('¡Registro exitoso! 📧\n\nPor favor revisa tu correo electrónico (incluyendo la carpeta de spam) para verificar tu cuenta antes de iniciar sesión.');
    navigate('/');
  } else {
    alert(result.error || 'Error al registrarse');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C] relative overflow-hidden py-8">
      {/* Fondo con el gato */}
      <div className="absolute left-0 top-0 w-[700px] h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-95"></div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center w-full">
        {/* Tarjeta */}
        <div className="w-[520px] bg-[#FFE5C2]/90 backdrop-blur-md rounded-3xl shadow-lg px-10 py-8 flex flex-col max-h-[90vh] overflow-y-auto">
          <h1 className="text-4xl font-extrabold text-[#B24700] mb-6 text-center">
            Crear cuenta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.firstName ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Nombre"
                required
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.lastName ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Apellido"
                required
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Usuario */}
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.username ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Nombre de usuario"
                required
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.email ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Correo electrónico"
                required
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.birthDate ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                required
              />
              {errors.birthDate && (
                <p className="text-red-600 text-xs mt-1">{errors.birthDate}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.location ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Ubicación (ej: Santiago, Chile)"
                required
              />
              {errors.location && (
                <p className="text-red-600 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.password ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Contraseña (mínimo 6 caracteres)"
                required
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'ring-2 ring-red-400' : 'focus:ring-orange-400'
                }`}
                placeholder="Confirmar contraseña"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F45C1C] hover:bg-[#e05318] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>

            {/* Botón para volver al login */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-[#B24700] hover:underline font-medium"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Logo MUSH */}
      <h2 className="absolute bottom-6 left-12 text-5xl font-extrabold text-[#B24700]">
        MUSH
      </h2>
    </div>
  );
};

export default RegisterPage;