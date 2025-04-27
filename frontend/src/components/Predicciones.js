// src/components/Predicciones.js
import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Predicciones = () => {
  const { fullName } = useOutletContext();

  return (
    <>
      <img src="/icons/fondo.png" alt="Fondo Predicciones" className="background-img" />
      <div className="welcome-text">
        <h2>Hola {fullName}, consulta tus predicciones</h2>
      </div>
    </>
  );
};

export default Predicciones;
