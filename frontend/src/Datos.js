import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Datos = () => {
  // Estado para almacenar los datos que obtenemos
  const [data, setData] = useState(null);

  // useEffect para hacer la solicitud HTTP al backend cuando se monte el componente
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/');  // Cambia esta URL si es necesario
        setData(response.data);  // Guardamos los datos en el estado
      } catch (error) {
        console.error('Error al obtener datos', error);
      }
    };

    obtenerDatos();  // Llamamos a la función para obtener los datos
  }, []);  // El array vacío asegura que solo se ejecute una vez cuando se monte el componente

  // Mostrar un mensaje de carga mientras se obtienen los datos
  if (!data) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Datos del Backend</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* Muestra los datos en formato JSON */}
    </div>
  );
};

export default Datos;
