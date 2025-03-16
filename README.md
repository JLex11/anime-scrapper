<div align="center">
  <h1>🍥 Anime Scrapper 🍥</h1>
  <p>Una herramienta potente para extraer información de sitios web de anime</p>
  
  <p>
    <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white" alt="Bun JS">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/status-en%20desarrollo-yellow?style=for-the-badge" alt="Estado">
  </p>
</div>

## 📋 Descripción

**Anime Scrapper** es una herramienta de línea de comandos desarrollada con Bun.js que permite extraer información sobre animes desde varios sitios web populares. Con esta herramienta puedes obtener datos como títulos, sinopsis, episodios, calificaciones y más, todo de manera rápida y eficiente.

## ✨ Características

- 🚀 **Rápido y Eficiente**: Aprovecha la velocidad de Bun.js para realizar scraping rápido
- 🌐 **Soporte Multi-Sitio**: Extrae información de múltiples fuentes de anime
- 💾 **Exportación de Datos**: Guarda los resultados en formatos JSON o CSV
- 🔍 **Búsqueda Avanzada**: Encuentra animes por nombre, género, temporada, etc.
- 🖼️ **Descarga de Imágenes**: Opción para descargar portadas e imágenes

## 📦 Requisitos previos

- [Bun](https://bun.sh) v1.2.5 o superior

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

### Comando básico

```bash
bun run index.js
```

### Opciones disponibles

```bash
# Buscar por nombre de anime
bun run index.js --search "Naruto"

# Especificar fuentes
bun run index.js --source crunchyroll

# Limitar resultados
bun run index.js --limit 10

# Exportar a CSV
bun run index.js --export csv
```

## 📊 Ejemplos

### Ejemplo de salida JSON

```json
{
  "title": "Attack on Titan",
  "originalTitle": "進撃の巨人",
  "episodes": 75,
  "status": "Finalizado",
  "genres": ["Acción", "Drama", "Fantasía"],
  "rating": 9.2
}
```

## 📁 Estructura del proyecto

```
anime-scrapper/
├── index.js          # Punto de entrada
├── src/
│   ├── scrapers/     # Módulos de scraping para cada sitio
│   ├── utils/        # Utilidades y helpers
│   └── output/       # Generadores de formato de salida
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
