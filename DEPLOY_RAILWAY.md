# Despliegue en Railway — submódulo web-admin

Este repo (`web-admin/`) se despliega **solo**, sin el monorepo padre.

## Configuración en Railway

| Campo | Valor |
|-------|--------|
| **Repositorio** | Repo del submódulo `web-admin` (no el monorepo) |
| **Root Directory** | `/` (raíz del repo web-admin) |
| **Builder** | Dockerfile (detectado vía `railway.toml`) |
| **Dockerfile** | `Dockerfile` |
| **Servicio** | `DTS-web-admin` |

> **Importante:** `NEXT_PUBLIC_API_URL` se embebe en el bundle en **build time**.  
> Configura las variables **antes** del primer deploy o tras cambiar la URL del backend haz **redeploy**.

## Variables de entorno (DTS-web-admin)

Copia en **DTS-web-admin → Variables**. Sin comillas.

### Obligatorias

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://${{DTS-backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1
```

Si la referencia `${{DTS-backend...}}` no resuelve, usa la URL pública explícita del backend:

```env
NEXT_PUBLIC_API_URL=https://dts-backend-production-c84e.up.railway.app/api/v1
```

`PORT` lo asigna Railway automáticamente — no la definas manualmente.

### Networking

1. **Generate Domain** en DTS-web-admin → Settings → Networking  
   (ej. `dts-web-admin-production.up.railway.app`)
2. Anota la URL para el paso del backend (WEB_URL)

## Variable en DTS-backend (obligatoria para emails)

Los enlaces de verificación de email y recuperación de contraseña usan `WEB_URL` en Django.

En **DTS-backend → Variables** añade o actualiza:

```env
WEB_URL=https://${{DTS-web-admin.RAILWAY_PUBLIC_DOMAIN}}
```

Sin esto, los correos apuntarán a `http://localhost:3000`.

## Enlazar CLI (opcional)

```bash
cd web-admin
railway link -p fc100e44-9ee0-4dd8-bc42-ece8b59d88ea -e production -s DTS-web-admin
railway status
railway logs
```

## Verificar

```bash
curl -I https://tu-web-admin.up.railway.app/login
```

Abre en el navegador:

- Login: `https://tu-web-admin.up.railway.app/login`
- Landing merchant: `https://tu-web-admin.up.railway.app/vender`

## Arquitectura

```
Browser → DTS-web-admin (Next.js BFF /api/*)
              ↓ server-side fetch
         DTS-backend (/api/v1/*)
```

Las cookies JWT viven en el dominio del web-admin. El backend solo recibe Bearer tokens desde el servidor Next.js.

Imágenes de producto/logos se sirven desde el dominio del **backend** (`MEDIA_PUBLIC_BASE_URL`).

## Troubleshooting

| Error | Solución |
|-------|----------|
| `NEXT_PUBLIC_API_URL no configurada` en login | Variable faltante o redeploy tras añadirla |
| API 404 / conexión rechazada | URL backend incorrecta; verifica dominio público DTS-backend |
| Imágenes rotas | Revisa `MEDIA_PUBLIC_BASE_URL` en DTS-backend |
| Links de email van a localhost | Añade `WEB_URL` en DTS-backend con dominio web-admin |
| Healthcheck falla | Ruta `/login` debe responder 200; revisa logs de build |
| Cambié URL del backend y sigue la antigua | Redeploy web-admin (NEXT_PUBLIC_* es build-time) |

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run dev
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
