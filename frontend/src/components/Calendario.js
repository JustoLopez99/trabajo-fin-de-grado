// src/components/Calendario.js
import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Calendario = () => {
  const { fullName } = useOutletContext();

  return (
    <>
      <img src="/icons/fondo.png" alt="Fondo Calendario" className="background-img" />
      <div className="welcome-text">
        <h2>Hola {fullName}, aquí tienes tu calendario</h2>
      </div>
    </>
  );
};

export default Calendario;
