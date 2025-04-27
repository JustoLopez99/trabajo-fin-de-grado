// src/components/Estadisticas.js
import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Estadisticas = () => {
  const { fullName } = useOutletContext();

  return (
    <>
      <img src="/icons/fondo.png" alt="Fondo Estadísticas" className="background-img" />
      <div className="welcome-text">
        <h2>Hola {fullName}, aquí puedes ver tus estadísticas</h2>
      </div>
    </>
  );
};

export default Estadisticas;
