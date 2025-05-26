// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Estilo from './Estilo'; // Tu layout general que ya usa Tailwind

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    if (!formData.email || !formData.password) {
      setError('Por favor, introduce tu correo y contraseña.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/users/login', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/principal'); 
      } else {
        setError(response.data.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    }
  };

  const formInputClasses = "block w-full my-2 p-2 border-none rounded-[5px] bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500";
  
  const formButtonClasses = "mt-4 w-full p-[0.6rem] bg-slate-800 text-white border-none rounded-[5px] font-bold cursor-pointer hover:bg-slate-700 transition-colors duration-150 ease-in-out";

  return (
    <Estilo>
      <div className="bg-[#778899]/60 p-8 rounded-[10px] text-center w-full max-w-[350px] sm:max-w-[400px] shadow-xl mx-auto">
        <h2 className="text-3xl font-semibold text-white mb-6 [text-shadow:1px_1px_2px_rgba(0,0,0,0.4)]">
          Iniciar Sesión
        </h2>

        {error && (
          <p className="bg-red-200/80 border-l-4 border-red-600 text-red-800 px-4 py-2 rounded-md mb-4 text-sm shadow">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className={formInputClasses}
            value={formData.email}
            onChange={handleChange}
            required
            aria-label="Correo electrónico"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className={formInputClasses}
            value={formData.password}
            onChange={handleChange}
            required
            aria-label="Contraseña"
          />
          <button type="submit" className={formButtonClasses}>
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 text-sm text-white"> {/* El texto "¿No tienes cuenta?" sigue siendo blanco */}
          ¿No tienes cuenta?{' '}
          {/* Enlace "Regístrate aquí" como texto con color slate-800 */}
          <Link 
            to="/register" 
            className="font-semibold text-slate-800 hover:text-slate-600 hover:underline transition-colors duration-150 ease-in-out"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </Estilo>
  );
};

export default Login;