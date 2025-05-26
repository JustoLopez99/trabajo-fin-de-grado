// server.js

// Importa el framework Express
const express = require('express');
const app = express(); // Inicializa la aplicación

// Importa el cliente de PostgreSQL
const { Client } = require('pg');

// Importa middleware CORS para controlar accesos desde otros dominios
const cors = require('cors');

// Importa las rutas
const userRoutes = require('./routes/userRoutes');
const calendarioRoutes = require('./routes/calendarioRoutes');
const datosRoutes = require('./routes/datosRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes'); 

const port = 3000; // Puerto donde se ejecutará el servidor

// Configura CORS para permitir peticiones solo desde el frontend
const corsOptions = {
  origin: 'http://localhost:3001',   // Dirección del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos HTTP permitidos (PATCH añadido)
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas (Content-Type y Authorization importantes)
  credentials: true,                 // Permitir cookies y headers de sesión
};

app.use(cors(corsOptions)); // Aplica CORS con la configuración definida

// Middleware para interpretar JSON en los cuerpos de las peticiones
// DEBE ESTAR ANTES DE LAS RUTAS QUE MANEJAN JSON
app.use(express.json());

// Permite parsear datos de formularios (si los usas, aunque para esta API es principalmente JSON)
app.use(express.urlencoded({ extended: true }));


// Configura y conecta a PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'postgres',               // Nombre del contenedor en Docker (o tu host de DB)
  database: 'strackwave_db',
  password: 'password',           // Tu contraseña de PostgreSQL
  port: 5432,                     // Puerto estándar de PostgreSQL
});

client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error de conexión a PostgreSQL:', err.stack));


// Aplica las rutas de usuario bajo el prefijo /api/users
app.use('/api/users', (req, res, next) => {
  // console.log('Ruta /api/users alcanzada'); // Log para depuración (opcional)
  req.dbClient = client; // Asigna la instancia de la base de datos a cada request para estas rutas
  next();
}, userRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de Strackwave!');
});

// Para el calendario
// Las rutas en calendarioRoutes usarán la instancia 'client' importada directamente en Task.js
app.use('/api', calendarioRoutes);


// Para datos
// Las rutas en datosRoutes usarán la instancia 'client' importada directamente si es necesario
app.use('/api', datosRoutes);
app.use('/api', estadisticasRoutes);  

// Inicia el servidor en el puerto definido
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});