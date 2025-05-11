# Optimizaciones de Rendimiento para API

Este documento describe las optimizaciones de rendimiento implementadas en la API para mejorar su funcionamiento tanto en el entorno serverless (Vercel) como en el entorno Node.js normal (Render).

## Optimizaciones Implementadas

### 1. Compresión de Respuestas
- Se ha añadido el middleware `compression` para reducir el tamaño de las respuestas HTTP.
- Esto mejora significativamente los tiempos de carga, especialmente para respuestas con grandes conjuntos de datos.

### 2. Sistema de Caché Mejorado
- Implementación de un servicio de caché avanzado con múltiples niveles TTL (Time-To-Live).
- Caché en memoria optimizado para entornos serverless.
- Estrategia getOrSet para patrones comunes de obtención de datos.

### 3. Rate Limiting
- Protección contra abusos con límites de tasa adaptados a cada entorno.
- Límites más restrictivos para rutas de búsqueda y más permisivos para rutas de imágenes.
- Diferenciación entre entorno serverless y Node.js normal.

### 4. Optimización de Imágenes
- Procesamiento eficiente de imágenes con `sharp`.
- Compatibilidad con formatos modernos como WebP y AVIF.
- Ajuste dinámico de tamaño y calidad según parámetros de consulta.

### 5. Caché HTTP
- Cabeceras de caché correctamente configuradas para CDN y navegadores.
- Tiempos de caché más largos para recursos estáticos (imágenes).
- Implementación de stale-while-revalidate para mantener la frescura.

### 6. Middleware de Caché Express
- Caché en memoria para rutas de API enteras.
- Diferentes estrategias TTL según el tipo de datos.
- Bypass para solicitudes autenticadas.

### 7. Logging Mejorado
- Sistema de registro estructurado con Winston.
- Diferentes niveles de registro según el entorno.

### 8. Optimizaciones de Serverless
- Arranque rápido para reducir cold starts.
- Gestión eficiente de la memoria.
- Configuración optimizada en `vercel.json`.

### 9. Gestión de Errores Robusta
- Manejo centralizado de errores.
- Respuestas de error consistentes y seguras.
- Registro detallado para depuración.

### 10. Optimizaciones de Base de Datos
- Operaciones asíncronas no bloqueantes.
- Procesamiento en segundo plano para operaciones costosas.

### 11. Interfaz de Documentación de API
- Implementación de una interfaz de usuario HTML/CSS/JS para reemplazar la documentación en texto plano.
- Búsqueda interactiva y filtrado de endpoints.
- Capacidad para probar endpoints directamente desde la documentación.
- Visualización detallada de parámetros y ejemplos.
- Funcionalidad responsive para dispositivos móviles.

## Entornos

### Vercel (Serverless)
- Optimizado para cold starts.
- Caché eficiente para reducir carga.
- Límites de tasa adaptados a arquitectura sin estado.

### Render (Node.js)
- Gestión adecuada de recursos.
- Apagado controlado para liberar recursos.
- Límites de tasa adaptados a instancia persistente.

## Comandos Útiles

- `npm run build:optimized` - Compilación optimizada para producción
- `npm run analyze` - Analizar el tamaño del bundle
- `npm run clean-cache` - Limpiar caché de compilación
