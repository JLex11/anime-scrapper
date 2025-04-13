# Usar la imagen oficial de Bun como base
FROM oven/bun:latest

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de configuración de dependencias
COPY package.json ./

# Instalar las dependencias
RUN bun install --frozen-lockfile

# Copiar el resto del código fuente del proyecto
COPY . .

# Comando por defecto para ejecutar el script de workers
CMD ["bun", "run", "start:workers"]