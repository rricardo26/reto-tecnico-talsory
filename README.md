# Interseguro - Suite de Retos Técnicos 1 y 2

Arquitectura de microservicios con API Gateway unificado (Nginx), Frontend SPA (Vue 3), Traductor de Endosos (Node.js/Hapi) y Rutas Óptimas (Go/Dijkstra).

## Despliegue con Docker Compose

```bash
docker compose up --build -d
```

## Endpoints Unificados (vía Nginx Gateway en :8080)

- **Frontend SPA**: [http://localhost:8080](http://localhost:8080)
- **Generador de Token JWT**: `POST http://localhost:8080/api/v1/auth/token`
- **Reto 1 - Traducción de Endosos**: `POST http://localhost:8080/api/v1/endorse/translate`
- **Reto 2 - Cálculo de Ruta Óptima**: `POST http://localhost:8080/api/v1/routes/optimal`

*Acceso directo a APIs (desarrollo): Endosos en `:3000`, Rutas en `:8081`.*

## Detener Servicios

```bash
docker compose down -v
```
