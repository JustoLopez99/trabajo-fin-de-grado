// src/components/Principal.js
import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Principal = () => {
  const { fullName } = useOutletContext();

  return (
    <>
      <img src="/icons/fondo.png" alt="Fondo" className="background-img" />
      <div className="welcome-text">
        <h2>Bienvenido {fullName}, consulta tus novedades</h2>
      </div>
    </>
  );
};

export default Principal;
