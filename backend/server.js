const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});

// Conectar con la base de datos

const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'postgres',
  database: 'strackwave_db',
  password: 'password',
  port: 5432,
});

client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error de conexión:', err.stack));
