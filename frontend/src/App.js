// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación de componentes
import Index from './components/Index';
import Register from './components/Register';
import Login from './components/Login';
import Principal from './components/Principal';
import Datos from './components/Datos';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas';
import Predicciones from './components/Predicciones';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout'; // Nuevo layout que contiene la estructura fija

const App = () => {
  return (
    <div className="App">
      <main>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Index />} /> {/* 👈 Esta es la portada o index */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas que comparten Layout */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/principal" element={<Principal />} />
            <Route path="/datos" element={<Datos />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/predicciones" element={<Predicciones />} />
          </Route>

          {/* Ruta catch-all: cualquier otra URL redirige al login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

// Componente envuelto en Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
