// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Estilo from './Estilo'; // Tu layout general que ya usa Tailwind

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  // El mensaje de éxito no se usa activamente en este flujo de login, pero se mantiene por si acaso.
  // const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    // setMessage(''); // Limpiar mensajes previos

    if (!formData.email || !formData.password) {
      setError('Por favor, introduce tu correo y contraseña.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/users/login', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Opcional: mostrar un mensaje de éxito brevemente antes de redirigir
        // setMessage('¡Inicio de sesión exitoso! Redirigiendo...');
        // setTimeout(() => {
        //   navigate('/principal'); // O a la ruta que corresponda después del login
        // }, 1000);
        navigate('/principal'); // Redirección inmediata (o a /Layout si esa es tu página principal post-login)
      } else {
        // Esta condición podría no alcanzarse si el backend siempre devuelve error HTTP en caso de fallo
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

  // Clases de Tailwind para los inputs y el botón del formulario, basadas en el CSS original
  // .form-box input: display: block; width: 100%; margin: 0.5rem 0; padding: 0.5rem; border: none; border-radius: 5px;
  const formInputClasses = "block w-full my-2 p-2 border-none rounded-[5px] bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400";
  // .form-box button: margin-top: 1rem; width: 100%; padding: 0.6rem; background-color: white; border: none; border-radius: 5px; color: black; font-weight: bold; cursor: pointer;
  // .form-box button:hover: background-color: #708090; (y color: white para contraste)
  const formButtonClasses = "mt-4 w-full p-[0.6rem] bg-white border-none rounded-[5px] text-black font-bold cursor-pointer hover:bg-[#708090] hover:text-white transition-colors duration-150 ease-in-out";

  return (
    <Estilo> {/* Usa el layout general Estilo.js */}
      {/* Este es el contenido que se pasará como {children} a Estilo.js */}
      {/* El div de Estilo.js con 'children' ya tiene 'relative z-10 p-4', así que este form-box se renderizará dentro */}
      {/* .form-box */}
      <div className="bg-[#778899]/60 p-8 rounded-[10px] text-center w-full max-w-[350px] sm:max-w-[400px] shadow-xl mx-auto">
        <h2 className="text-3xl font-semibold text-white mb-6 [text-shadow:1px_1px_2px_rgba(0,0,0,0.4)]">
          Iniciar Sesión
        </h2>

        {/* {message && ( // Mensaje de éxito, si se implementa
          <p className="bg-green-100/90 border-l-4 border-green-500 text-green-700 px-4 py-2 rounded-md mb-4 text-sm shadow">
            {message}
          </p>
        )} */}
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

        {/* .register-link */}
        <p className="mt-6 text-sm text-white">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-blue-200 hover:text-blue-100 hover:underline transition-colors duration-150 ease-in-out">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </Estilo>
  );
};

export default Login;
