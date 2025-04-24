// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Si hay token, renderiza el componente hijo (autenticado)
  if (token) {
    return children;
  }

  // Si no hay token, redirige al login
  return <Navigate to="/login" />;
};

export default PrivateRoute;
