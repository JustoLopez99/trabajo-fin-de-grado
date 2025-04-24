// Importa el módulo Client de 'pg' para conectarse a PostgreSQL
const { Client } = require('pg');

// Crea una nueva instancia de cliente con los parámetros de conexión
const client = new Client({
  user: 'postgres',             // Usuario de PostgreSQL
  host: 'postgres',             // Nombre del servicio del contenedor Docker
  database: 'strackwave_db',    // Nombre de la base de datos
  password: 'password',         // Contraseña del usuario
  port: 5432,                   // Puerto por defecto de PostgreSQL
});

// Inicia la conexión con la base de datos
client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))             // Conexión exitosa
  .catch((err) => console.error('Error de conexión:', err.stack)); // Manejo de errores

// Exporta el cliente para usarlo en otras partes del proyecto
module.exports = client;
