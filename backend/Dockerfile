# Usa una imagen base oficial de Node.js
FROM node:16

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Instala netcat (nc) y PostgreSQL client (psql) para usar en el script wait-for-it.sh
RUN apt-get update && apt-get install -y netcat postgresql-client

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Copia el script wait-for-it.sh al contenedor
COPY wait-for-it.sh /app/wait-for-it.sh

# Da permisos de ejecución al script
RUN chmod +x /app/wait-for-it.sh

# Expone el puerto que la aplicación usará (por ejemplo, el puerto 3000)
EXPOSE 3000

# El comando para iniciar la aplicación cuando el contenedor se ejecute
CMD ["npm", "start"]
