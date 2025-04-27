// src/components/Datos.js
import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Datos = () => {
  const { fullName } = useOutletContext();

  return (
    <>
      <img src="/icons/fondo.png" alt="Fondo Datos" className="background-img" />
      <div className="welcome-text">
        <h2>Hola {fullName}, aquí están tus datos</h2>
      </div>
    </>
  );
};

export default Datos;
