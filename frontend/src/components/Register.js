// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Estilo from './Estilo'; // Este es tu layout público (Estilo.js)

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.name,
      last_name: formData.surname
    };

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/users/register', payload);
      setMessage('¡Registro exitoso! Redirigiendo al login...');
      setFormData({ username: '', email: '', password: '', name: '', surname: '' }); // Limpiar formulario
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Retraso para que el usuario vea el mensaje
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
          Crear Cuenta
        </h2>

        {message && (
          <p className="bg-green-100/90 border-l-4 border-green-500 text-green-700 px-4 py-2 rounded-md mb-4 text-sm shadow">
            {message}
          </p>
        )}
        {error && (
          <p className="bg-red-200/80 border-l-4 border-red-600 text-red-800 px-4 py-2 rounded-md mb-4 text-sm shadow">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            className={formInputClasses}
            value={formData.username}
            onChange={handleChange}
            required
            aria-label="Nombre de usuario"
          />
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
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            className={formInputClasses}
            value={formData.name}
            onChange={handleChange}
            required
            aria-label="Nombre"
          />
          <input
            type="text"
            name="surname"
            placeholder="Apellido"
            className={formInputClasses}
            value={formData.surname}
            onChange={handleChange}
            required
            aria-label="Apellido"
          />
          <button type="submit" className={formButtonClasses}>
            Registrar
          </button>
        </form>

        <p className="mt-6 text-sm text-white">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-blue-200 hover:text-blue-100 hover:underline transition-colors duration-150 ease-in-out">
            Inicia sesión
          </Link>
        </p>
      </div>
    </Estilo>
  );
};

export default Register;
