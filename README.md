<div align="center">
  <h1>🍥 Anime Scrapper 🍥</h1>
  <p>Una herramienta potente para extraer información de sitios web de anime</p>
  
  <p>
    <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white" alt="Bun JS">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
    <img src="https://img.shields.io/badge/status-en%20desarrollo-yellow?style=for-the-badge" alt="Estado">
  </p>
</div>

## 📋 Descripción

**Anime Scrapper** es una solución completa para obtener información sobre animes desde varios sitios web populares. Incluye una herramienta de scraping de línea de comandos y una API REST para acceder a los datos almacenados. Con esta herramienta puedes obtener datos como títulos, sinopsis, episodios, calificaciones y más, todo de manera rápida y eficiente.

## ✨ Características

- 🚀 **Rápido y Eficiente**: Aprovecha la velocidad de Bun.js para realizar scraping rápido
- 🌐 **Soporte Multi-Sitio**: Extrae información de múltiples fuentes de anime
- 💾 **Exportación de Datos**: Guarda los resultados en formatos JSON o CSV
- 🔍 **Búsqueda Avanzada**: Encuentra animes por nombre, género, temporada, etc.
- 🖼️ **Descarga de Imágenes**: Opción para descargar portadas e imágenes
- 🔄 **API REST**: Accede a los datos a través de una API bien estructurada
- 📊 **Base de Datos**: Almacenamiento persistente con Supabase
- 📱 **Búsqueda en Tiempo Real**: Búsqueda de texto completo para encontrar animes rápidamente

## 📦 Requisitos previos

- [Bun](https://bun.sh) v1.2.5 o superior
- Una cuenta en [Supabase](https://supabase.com/) para la base de datos

## 🚀 Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/tuusuario/anime-scrapper.git
cd anime-scrapper
```

2. Instala las dependencias:
```bash
bun install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita el archivo .env con tus credenciales de Supabase
```

## ⚙️ Configuración

Para personalizar las fuentes y opciones de scraping, edita el archivo `config.js`:

```javascript
// Ejemplo de configuración
module.exports = {
  sources: ['crunchyroll', 'funimation'],
  downloadImages: true,
  outputFormat: 'json'
};
```

## 📚 Uso

### Herramienta CLI

```bash
# Comando básico
bun run index.js

# Buscar por nombre de anime
bun run index.js --search "Naruto"

# Especificar fuentes
bun run index.js --source crunchyroll

# Limitar resultados
bun run index.js --limit 10

# Exportar a CSV
bun run index.js --export csv
```

### API REST

Iniciar el servidor:

```bash
bun run start:api
```

Endpoints disponibles:

```bash
# Obtener todos los animes (paginados)
GET /api/animes?page=1

# Obtener los últimos animes
GET /api/animes/latest?limit=10

# Obtener animes en emisión
GET /api/animes/broadcast?limit=20

# Obtener animes por rating
GET /api/animes/rating?limit=15

# Buscar animes por texto
GET /api/animes/search/:query?page=1&pageSize=10

# Obtener información detallada de un anime
GET /api/animes/:animeId

# Obtener episodios de un anime
GET /api/animes/:animeId/episodes?offset=0&limit=12
```

## 📊 Ejemplos

### Ejemplo de salida JSON de la API

```json
{
  "animeId": "attack-on-titan",
  "title": "Attack on Titan",
  "originalTitle": "進撃の巨人",
  "episodes": 75,
  "status": "Finalizado",
  "genres": ["Acción", "Drama", "Fantasía"],
  "rating": 9.2,
  "images": {
    "poster": "https://example.com/poster.jpg",
    "banner": "https://example.com/banner.jpg"
  }
}
```

## 📁 Estructura del proyecto

```
anime-scrapper/
├── index.js          # Punto de entrada CLI
├── src/
│   ├── scrapers/     # Módulos de scraping para cada sitio
│   ├── services/     # Servicios (base de datos, etc.)
│   ├── utils/        # Utilidades y helpers
│   ├── enums/        # Enumeraciones y constantes
│   └── types/        # Tipos TypeScript
├── api/
│   ├── router/       # Rutas de la API
│   ├── controllers/  # Controladores de la API
│   └── index.ts      # Punto de entrada de la API
├── config.js         # Configuración principal
└── README.md         # Este archivo
```

## 🤝 Contribución

Las contribuciones son siempre bienvenidas!

1. Fork el proyecto
2. Crea una nueva rama (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios
4. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
5. Push a la rama (`git push origin feature/amazing-feature`)
6. Abre un Pull Request

## 📜 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.

---

<div align="center">
  <p>Desarrollado con ❤️ por Alexander</p>
</div>
