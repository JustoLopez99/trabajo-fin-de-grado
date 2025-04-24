// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Principal from './components/Principal';
import Datos from './components/Datos';
import Calendario from './components/Calendario';
import Estadisticas from './components/Estadisticas';
import Predicciones from './components/Predicciones';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <div className="App">
      <main>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con PrivateRoute */}
          <Route path="/principal" element={
            <PrivateRoute><Principal /></PrivateRoute>
          } />
          <Route path="/datos" element={
            <PrivateRoute><Datos /></PrivateRoute>
          } />
          <Route path="/calendario" element={
            <PrivateRoute><Calendario /></PrivateRoute>
          } />
          <Route path="/estadisticas" element={
            <PrivateRoute><Estadisticas /></PrivateRoute>
          } />
          <Route path="/predicciones" element={
            <PrivateRoute><Predicciones /></PrivateRoute>
          } />

          {/* Ruta por defecto */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
