const express = require('express');
const app = express();
const { Client } = require('pg');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const port = 3000;

// Middleware para permitir CORS solo desde el frontend
const corsOptions = {
  origin: 'http://localhost:3001',  // Asegúrate de que este sea el nombre correcto del servicio frontend
  methods: ['GET', 'POST'],        // Métodos permitidos
  credentials: true,               // Permite el envío de cookies
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));  // Para manejar datos enviados por formularios tradicionales


// Middleware
app.use(express.json());

// Conectar con PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'postgres',  // En Docker, este debe coincidir con el nombre del servicio
  database: 'strackwave_db',
  password: 'password',
  port: 5432,
});

client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error de conexión:', err.stack));

// Guardar cliente como global (opcional pero práctico)
app.locals.dbClient = client;

// Rutas
app.use('/api/users', (req, res, next) => {
  console.log('Ruta /api/users alcanzada');  // Verifica que esta línea se imprima
  req.dbClient = client;
  next();
}, userRoutes);

app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
