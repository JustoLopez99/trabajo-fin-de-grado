// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'; 
import Datos from './Datos';  // Importa el componente Datos 
import Register from './components/Register';  // Importa el componente de registro
import Login from './components/Login';  // Importa el componente de inicio de sesión
import Principal from './components/Principal';  // Importa el componente de la página principal

function App() {
  // Verifica si el usuario está autenticado mirando si hay un token en el localStorage
  const isAuthenticated = !!localStorage.getItem('token'); // Si hay un token, el usuario está autenticado

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Mi Aplicación de Marketing Digital</h1>
          <p>Bienvenido al sistema de gestión de campañas de marketing.</p>
        </header>

        <nav>
          <ul>
            <li>
              <Link to="/register">Registrar Usuario</Link>
            </li>
            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/datos">Ver Datos</Link>
            </li>
            <li>
              {/* Solo muestra el link a la página principal si el usuario está autenticado */}
              {isAuthenticated && <Link to="/principal">Página Principal</Link>}
            </li>
          </ul>
        </nav>

        <main>
          <Routes>
            {/* Rutas para los componentes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/datos" element={<Datos />} />
            
            {/* Ruta para la página principal */}
            {/* Si el usuario no está autenticado, redirige al login */}
            <Route 
              path="/principal" 
              element={isAuthenticated ? <Principal /> : <Navigate to="/login" />} 
            />
            
            {/* Ruta por defecto que redirige al login */}
            <Route path="/" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
