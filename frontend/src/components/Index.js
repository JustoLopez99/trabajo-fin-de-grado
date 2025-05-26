// src/components/Index.js
import React from 'react';
import Estilo from './Estilo'; // Tu componente que maneja el fondo

const Index = () => {

  const videoFileName = "bienvenida.mp4";
  const videoPath = `/icons/${videoFileName}`;

  return (
    <Estilo>
      <div className="flex justify-center items-center w-full h-full p-4">
        <video
          className="max-w-3xl w-full h-auto rounded-lg shadow-xl"
          src={videoPath}
          autoPlay 
          muted
          controls
          loop
        >
          {/* Mensaje para navegadores que no soportan el tag <video> */}
          Tu navegador no soporta el elemento de video.
        </video>
      </div>
    </Estilo>
  );
};

export default Index;