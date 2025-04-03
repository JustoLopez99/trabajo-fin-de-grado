# Usamos una imagen oficial de Node.js como base para el frontend
FROM node:16

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

# Exponemos el puerto en el que React servirá la aplicación
EXPOSE 3001

# Comando para iniciar el servidor de desarrollo de React
CMD ["npm", "start"]
