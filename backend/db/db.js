const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'postgres',  // Contenedor de PostgreSQL en Docker
  database: 'strackwave_db',
  password: 'password',
  port: 5432,
});

client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error de conexión:', err.stack));

module.exports = client;
