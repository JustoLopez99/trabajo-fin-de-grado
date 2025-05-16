// Importa el framework Express
const express = require('express');
const app = express(); // Inicializa la aplicación

// Importa el cliente de PostgreSQL
const { Client } = require('pg');

// Importa middleware CORS para controlar accesos desde otros dominios
const cors = require('cors');

// Importa las rutas de usuario
const userRoutes = require('./routes/userRoutes');
const  calendarioRoutes = require('./routes/calendarioRoutes');
const  datosRoutes = require('./routes/datosRoutes');

const port = 3000; // Puerto donde se ejecutará el servidor

// Configura CORS para permitir peticiones solo desde el frontend
const corsOptions = {
  origin: 'http://localhost:3001',   // Dirección del frontend
  methods: ['GET', 'POST'],          // Métodos HTTP permitidos
  credentials: true,                 // Permitir cookies y headers de sesión
};

app.use(cors(corsOptions)); // Aplica CORS con la configuración definida

// Permite parsear datos de formularios
app.use(express.urlencoded({ extended: true }));

// Middleware para interpretar JSON en los cuerpos de las peticiones
app.use(express.json());

// Configura y conecta a PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'postgres',               // Nombre del contenedor en Docker
  database: 'strackwave_db',
  password: 'password',
  port: 5432,
});

client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error de conexión:', err.stack));

// Guarda el cliente de base de datos como una variable accesible globalmente
app.locals.dbClient = client;

// Aplica las rutas de usuario bajo el prefijo /api/users
app.use('/api/users', (req, res, next) => {
  console.log('Ruta /api/users alcanzada'); // Log para depuración
  req.dbClient = client; // Asigna la instancia de la base de datos a cada request
  next();
}, userRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

// Para el calendario
app.use('/api', calendarioRoutes);


// Para datos
app.use('/api', datosRoutes);

// Inicia el servidor en el puerto definido
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
