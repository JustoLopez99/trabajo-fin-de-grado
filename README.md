# 📌 Trabajo Final de Grado: Aplicación Web para Gestión de Campañas de Marketing Digital  

## 📖 Introducción  
Se propone el desarrollo de una aplicación web para la gestión de campañas de marketing digital, permitiendo a los administradores (agencias de marketing) y clientes (empresas) organizar y analizar sus estrategias publicitarias.  

La plataforma permitirá el registro manual de métricas de cada publicación y contará con una base de datos inicial con posts anteriores para realizar análisis y optimizar futuras estrategias.  

---

## 🎯 Objetivos  
✔️ **Facilitar** la gestión de campañas de marketing digital para diferentes clientes.  
✔️ **Permitir** el registro y análisis manual de métricas de publicaciones.  
✔️ **Proporcionar** herramientas de visualización y análisis para mejorar la toma de decisiones.  
✔️ **Contar** con una base de datos inicial con registros históricos de posts para análisis comparativos.  

---

## 🔑 Funcionalidades Clave  

### 1️⃣ Gestión de Usuarios  
- 👤 **Administradores**: Gestionan campañas, clientes y análisis de datos.  
- 👥 **Clientes**: Pueden consultar sus métricas y solicitar nuevas campañas.  

### 2️⃣ Gestión de Publicaciones y Campañas  
📝 **Registro de posts anteriores** con datos clave:  
- 📌 Tipo de post (imagen, video, blog, etc.).  
- 📅 Fecha y hora de publicación.  
- 📆 Día de la semana.  
- 👀 Alcance (impresiones, vistas).  
- ❤️ Interacciones (me gusta, comentarios, compartidos).  
- 🔗 Número de clics en enlaces.  
- ✅ Si el post contenía un enlace o no.  
- ⏳ Tiempo de retención (en caso de videos).  
- 📊 Engagement total (interacciones / alcance).  

📅 **Creación y planificación de nuevas campañas** con un calendario interactivo.  

### 3️⃣ Registro Manual de Métricas  
- 🖊️ Interfaz intuitiva para ingresar datos de cada publicación tras su publicación.  
- 📊 Comparación de rendimiento con posts anteriores.  
- 🔍 Sugerencias para mejorar el alcance según datos históricos.  

### 4️⃣ Análisis y Visualización de Datos  
- 📈 **Gráficos interactivos** para evaluar el rendimiento de las publicaciones.  
- 📊 **Comparación de métricas** entre diferentes tipos de contenido.  
- 📅 **Identificación de tendencias** según el día de la semana y horario de publicación.  

### 5️⃣ Predicción y Optimización de Estrategias  
- ⏰ **Análisis de datos históricos** para determinar los mejores momentos para publicar.  
- 🖼️ **Sugerencias sobre formatos de contenido** más efectivos.  
- 📋 **Reportes de desempeño** con insights sobre oportunidades de mejora.  

---

## 🏗️ Estructura y Diseño de la Aplicación  

### 🏠 Página de Inicio (Dashboard)  
- 📊 Vista general con estadísticas y métricas clave.  
- 🚀 Acceso rápido a campañas activas y publicaciones recientes.  

### 📆 Sección de Gestión de Campañas  
- 🗓️ Calendario con programación de posts.  
- ✏️ Creación y edición de campañas con detalles específicos.  

### 📋 Sección de Registro de Métricas  
- 📝 Formulario intuitivo para ingresar datos después de cada publicación.  
- 📊 Visualización de datos en tiempo real.  

### 📊 Sección de Análisis y Reportes  
- 📈 Gráficos de tendencias y comparaciones.  
- 🎯 Filtros por fecha, tipo de post, interacción y más.  

---

## 🛠️ Tecnologías a Utilizar  

### 🌐 Frontend  
- 🎨 **React.js** para el desarrollo de la interfaz web. 
- 🖌️ **Tailwind CSS** para el diseño y estilos responsivos.
- 📊 **Gráficos (Chart.js, D3.js)**: Visualización de métricas.
- **React Native** para el desarrollo de la aplicación móvil.

### 🖥️ Backend  
- 🐍 **Node.js con Express.js** para manejar las solicitudes y la lógica del negocio.
- 

### 🗄️ Base de Datos  
- 🛢️ **PostgreSQL**: Almacenamiento de campañas y métricas.  
- 🖥️ **DBeaver**: Para administración y visualización de datos.  

### 🔒 Autenticación y Seguridad  
- 🔑 **JWT (JSON Web Token)** para una gestión segura de sesiones de usuario.

### Infraestructura y contenedores
- **Docker y Docker Compose** para contenerizar la aplicación web, el backend y la base de datos, asegurando portabilidad y escalabilidad.

