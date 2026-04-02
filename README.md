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

### Arquitectura actual (v2)

- Este repositorio expone una API **read-only** sobre Supabase.
- El scraping operativo vive en `anime-scraper-engine/` como motor separado en Bun.
- La API pública no ejecuta scraping ni optimización de imágenes en demanda.

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
- [Supabase CLI](https://supabase.com/docs/guides/cli) para desarrollo local (opcional)

## 🚀 Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/Jlex11/anime-scrapper.git
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

## 🗄️ Configuración de Supabase

### Configuración Remota (Producción)

Para conectar tu aplicación a una base de datos remota de Supabase:

1. Crea un proyecto en [Supabase](https://supabase.com)

2. Actualiza el archivo `.env` con tus credenciales de Supabase:

```plaintext
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_API_KEY=tu-clave-anon-key
```

3. Inicia la aplicación:

```bash
bun run start
```

### Configuración Local (Desarrollo)

Para configurar y ejecutar Supabase localmente:

1. Instala la CLI de Supabase:

```bash
# En Linux/macOS
curl -s https://packages.supabase.com/install.sh | bash

# En Windows (con PowerShell)
iwr https://packages.supabase.com/install.ps1 -useb | iex
```

2. Inicia los servicios de Supabase localmente:

```bash
# Desde la raíz del proyecto
supabase start
```

3. Actualiza el archivo `.env` con las credenciales locales:

```plaintext
SUPABASE_URL=http://localhost:54321
SUPABASE_API_KEY=tu-clave-anon-local # La clave se obtiene al ejecutar supabase start
```

4. Migra el esquema de la base de datos:

````bash
supabase db push
### Gestión de datos con Supabase

#### Crear un archivo de seed personalizado

Si ya has realizado scraping y quieres guardar esos datos como seed para futuras instalaciones:

```bash
# Exportar solo los datos (sin estructura) a un archivo personalizado
supabase db dump --data-only -f supabase/seeds/my_anime_data.sql

# Exportar estructura y datos
supabase db dump -f supabase/seeds/full_backup.sql
````

Para usar tu seed personalizado, edita el archivo `supabase/config.toml`:

```toml
[db.seed]
enabled = true
sql_paths = ["./seeds/my_anime_data.sql"] # Reemplaza con tu archivo
```

#### Restaurar datos desde un seed

```bash
# Aplicar esquema y datos de una sola vez
supabase db reset

# O para aplicar solo los datos sin restablecer el esquema
supabase db seed
```

### Sincronización entre Entornos

Para sincronizar el esquema entre tu entorno local y remoto:

1. Exporta el esquema de la base de datos local:

```bash
supabase db dump -f supabase/migrations/local_schema.sql
```

2. Aplica el esquema a la base de datos remota:
   - Opción 1: Desde la interfaz de Supabase, ve a "SQL Editor" y ejecuta el contenido del archivo SQL generado.
   - Opción 2: Usa la CLI con la conexión remota:
     ```bash
     supabase db push --db-url "postgresql://postgres:[PASSWORD]@tu-proyecto.supabase.co:5432/postgres"
     ```

## 📚 Uso

### Documentación interactiva

La documentación de la API está construida con **Astro** y se genera como un sitio estático alojado en `/api-docs`.

Comandos útiles:

```bash
# Modo desarrollador con recarga en caliente
bun run docs:dev

# Generar la versión estática en public/api-docs
bun run docs:build

# Revisar la build estática localmente
bun run docs:preview
```

Una vez generada, la documentación queda disponible en:

```
http://localhost:3000/api-docs/
```

El sitio permite:

- Consultar todo el contenido en Markdown por categorías
- Visualizar ejemplos de peticiones y respuestas
- Probar endpoints con el playground interactivo sin salir del navegador

También puedes obtener la lista de rutas en formato JSON desde:

```
http://localhost:3000/api/api-routes/
```

### API REST

Iniciar el servidor:

```bash
bun run start
```

Endpoints disponibles:

Algunos endpoints principales:

```bash
# Obtener todos los animes (paginados)
GET /api/animes?page=1

# Obtener los últimos animes
GET /api/animes/latest?limit=10

# Obtener animes en emisión
GET /api/animes/broadcast?limit=20

# Obtener animes por rating
GET /api/animes/latest/rating?limit=15

# Buscar animes por texto
GET /api/animes/search/:query?page=1&pageSize=10

# Obtener información detallada de un anime
GET /api/animes/:animeId

# Obtener episodios de un anime
GET /api/animes/:animeId/episodes?offset=0&limit=12
```

## 📊 Ejemplos

### Datos iniciales (Seed)

El archivo seed incluye:

- Estructura completa de la base de datos con tablas para animes y episodios
- Relaciones y restricciones entre tablas
- Funciones útiles como búsqueda de texto completo
- Políticas de seguridad configuradas para Supabase
- Un conjunto de datos de ejemplo con algunos animes populares

Para inspeccionar o modificar el archivo seed, consulta:

```
supabase/seeds/seed.sql
```

### Ejemplo de salida JSON de la API

```json
{
  "animeId": "overlord-movie-3-sei-oukokuhen",
  "title": "Overlord Movie 3: Sei Oukoku-hen",
  "type": "Película",
  "rank": 4.6,
  "otherTitles": [
    "Gekijouban Overlord: Sei Oukoku-hen",
    "劇場版「オーバーロード」聖王国編"
  ],
  "description": "",
  "originalLink": "https://www3.animeflv.net/anime/overlord-movie-3-sei-oukokuhen",
  "status": "Finalizado",
  "genres": ["Acción", "Aventuras", "Fantasía"],
  "images": {
    "coverImage": "https://cdn.tu-dominio/overlord-movie-3-sei-oukokuhen.webp",
    "carouselImages": [
      {
        "link": "https://cdn.tu-dominio/overlord-movie-3-sei-oukokuhen-carouselImage-0.webp",
        "width": 4500,
        "height": 8001,
        "position": "50% 20%"
      },
      {
        "link": "https://cdn.tu-dominio/overlord-movie-3-sei-oukokuhen-carouselImage-1.webp",
        "width": 1896,
        "height": 1033,
        "position": "50% 50%"
      }
    ]
  },
  "created_at": "2025-05-04T17:32:25.307+00:00",
  "updated_at": "2025-05-04T17:32:25.307+00:00"
}
```

## 📁 Estructura del proyecto

```
anime-scrapper/
├── api/                   # API read-only (Express)
├── src/                   # Servicios, tipos y utilidades de la API
├── docs/                  # Sitio de documentación Astro
├── supabase/              # Migraciones y seeds
├── anime-scraper-engine/  # Worker Bun de scraping + ingesta
├── openapi.yaml           # Contrato OpenAPI
└── README.md
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
