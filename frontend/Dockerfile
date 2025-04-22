# Usamos una imagen oficial de Node.js como base para el frontend
FROM node:16 AS build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo `package.json` y `package-lock.json` para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias necesarias para React
RUN npm install

# Copiamos el resto del código fuente de la aplicación
COPY . .

# Creamos la versión de producción de la aplicación React
RUN npm run build

# Ahora vamos a crear el contenedor para servir la aplicación en producción
FROM nginx:alpine

# Copiamos los archivos generados por `npm run build` al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiamos el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 3001 de Nginx (en lugar de 80)
EXPOSE 3001

# Iniciamos el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
