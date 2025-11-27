import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Calendar, MapPin, AtSign, ArrowRight } from 'lucide-react';

const FieldWithIcon = ({ Icon, name, placeholder, type = 'text', required, error, value, onChange, max }: {
  Icon: React.ElementType,
  name: string,
  placeholder: string,
  type?: string,
  required: boolean,
  error: string | undefined,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  max?: string,
}) => (
  <div>
    <div className={`flex items-center bg-white/90 rounded-xl shadow-inner px-4 py-3 border focus-within:ring-2 transition-all ${
      error ? 'border-red-400 focus-within:ring-red-400' : 'border-[#f3c7a5] focus-within:ring-[#F45C1C]'
    }`}>
      <Icon className={`w-5 h-5 mr-3 ${error ? 'text-red-500' : 'text-[#B24700]'}`} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
        placeholder={placeholder}
        required={required}
        max={max}
      />
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>
    )}
  </div>
);

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
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      newErrors.birthDate = 'Debes tener al menos 13 años';
    }

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
      alert('¡Registro exitoso! 📧\n\nPor favor revisa tu correo electrónico (incluyendo la carpeta de spam) para verificar tu cuenta antes de iniciar sesión.');
      navigate('/');
    } else {
      alert('Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD89C] relative overflow-hidden py-8">
      {/* Fondo con el gato */}
      <div className="absolute left-0 top-0 w-[700px] h-full bg-[url('./assets/gatoLoginIzquierda.png')] bg-contain bg-no-repeat bg-left opacity-95 pointer-events-none"></div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center w-full">
        {/* Tarjeta */}
        <div className="w-[520px] bg-[#FFE5C2]/90 backdrop-blur-md rounded-3xl shadow-xl px-10 py-8 flex flex-col max-h-[90vh] overflow-y-auto border border-[#f7cda3]">
          <h1 className="text-4xl font-extrabold text-[#B24700] mb-2 text-center">
            Únete a MUSH
          </h1>
          <p className='text-center text-gray-600 mb-6'>Crea tu cuenta en un instante.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre */}
            <FieldWithIcon 
              Icon={User} 
              name="firstName" 
              placeholder="Nombre" 
              required 
              error={errors.firstName} 
              value={formData.firstName} 
              onChange={handleChange}
            />

            {/* Apellido */}
            <FieldWithIcon 
              Icon={User} 
              name="lastName" 
              placeholder="Apellido" 
              required 
              error={errors.lastName} 
              value={formData.lastName} 
              onChange={handleChange}
            />

            {/* Usuario */}
            <FieldWithIcon 
              Icon={AtSign} 
              name="username" 
              placeholder="Nombre de usuario" 
              required 
              error={errors.username} 
              value={formData.username} 
              onChange={handleChange}
            />

            {/* Email */}
            <FieldWithIcon 
              Icon={Mail} 
              name="email" 
              placeholder="Correo electrónico" 
              type='email' 
              required 
              error={errors.email} 
              value={formData.email} 
              onChange={handleChange}
            />

            {/* Fecha de nacimiento */}
            <FieldWithIcon 
              Icon={Calendar} 
              name="birthDate" 
              placeholder="Fecha de nacimiento" 
              type='date' 
              required 
              error={errors.birthDate} 
              value={formData.birthDate} 
              onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
            />

           {/* Ubicación */}
            <FieldWithIcon 
              Icon={MapPin} 
              name="location" 
              placeholder="Ubicación (ej: Santiago, Chile)" 
              required 
              error={errors.location} 
              value={formData.location} 
              onChange={handleChange}
            />

            {/* Contraseña */}
            <FieldWithIcon 
              Icon={Lock} 
              name="password" 
              placeholder="Contraseña (mínimo 6 caracteres)" 
              type='password' 
              required 
              error={errors.password} 
              value={formData.password} 
              onChange={handleChange}
            />

            {/* Confirmar contraseña */}
            <FieldWithIcon 
              Icon={Lock} 
              name="confirmPassword" 
              placeholder="Confirmar contraseña" 
              type='password' 
              required 
              error={errors.confirmPassword} 
              value={formData.confirmPassword} 
              onChange={handleChange}
            />

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Botón de Registro  */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-[#F45C1C] hover:bg-[#c94917] text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-60 disabled:shadow-md mt-6"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Registrarme
                </>
              )}
            </button>

            {/* Botón para volver al login  */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-[#B24700] font-medium hover:text-[#8f3900] transition-colors group"
              >
                <span className='border-b border-transparent group-hover:border-[#8f3900]'>
                  ¿Ya tienes una cuenta? Inicia sesión
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Logo MUSH */}
      <h2 className="absolute bottom-6 left-12 text-5xl font-extrabold text-[#B24700] opacity-80">
        MUSH
      </h2>
    </div>
  );
};

export default RegisterPage;