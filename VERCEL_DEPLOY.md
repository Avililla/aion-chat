# Deploy de AION Chat en Vercel

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Backend de AION Agent desplegado y accesible (URL pública)
3. Cuenta en [GitHub](https://github.com)

## Pasos para Desplegar

### 1. Preparar Variables de Entorno

El proyecto necesita la siguiente variable de entorno en Vercel:

```
AION_BACKEND_URL=https://tu-backend-desplegado.com
```

**Importante**: El backend debe estar desplegado y ser accesible públicamente antes de desplegar el frontend.

### 2. Importar desde GitHub a Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Conecta tu cuenta de GitHub si no lo has hecho
5. Busca el repositorio `aion-chat`
6. Click en **"Import"**

### 3. Configurar el Proyecto

En la pantalla de configuración:

1. **Framework Preset**: Vercel detectará automáticamente Next.js
2. **Build Command**: `pnpm build` (o déjalo por defecto)
3. **Output Directory**: `.next` (por defecto)
4. **Install Command**: `pnpm install` (o déjalo por defecto)

### 4. Añadir Variables de Entorno

En la sección **"Environment Variables"**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `AION_BACKEND_URL` | `https://tu-backend-desplegado.com` | Production, Preview, Development |

**Ejemplo**:
```
AION_BACKEND_URL=https://aion-backend.railway.app
```

### 5. Deploy

1. Click en **"Deploy"**
2. Espera a que Vercel construya y despliegue tu proyecto (2-3 minutos)
3. Una vez completado, recibirás una URL como: `https://aion-chat.vercel.app`

## Configuración del Backend

El backend debe:

1. Estar desplegado y accesible públicamente
2. Tener CORS configurado para permitir requests desde tu dominio de Vercel:

```python
# En tu backend FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aion-chat.vercel.app",
        "https://*.vercel.app",  # Para previews
        "http://localhost:3000"   # Para desarrollo local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Opciones de Deploy del Backend

Puedes desplegar el backend en:

- **Railway**: Recomendado, fácil setup con Docker
- **Render**: Plan gratuito disponible
- **Google Cloud Run**: Escala automáticamente
- **AWS EC2**: Mayor control
- **DigitalOcean App Platform**: Balance precio/features

## Limitaciones de Vercel

### Plan Free
- **Timeout**: 10 segundos máximo por request
- **Edge Runtime**: 30 segundos si usas `export const runtime = 'edge'`
- **Serverless Functions**: 10 segundos por defecto

### Solución al Timeout

Si tu backend tarda más de 10 segundos en responder, tienes estas opciones:

1. **Upgrade a Pro** ($20/mes): 60 segundos de timeout
2. **Implementar Streaming Real**: Usar AI SDK con `streamText()` para evitar timeouts
3. **Optimizar Backend**: Hacer respuestas más rápidas con caché

### Streaming Real (Recomendado para Producción)

El código actual simula streaming, pero para producción deberías implementar streaming real:

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    async onFinish({ text }) {
      // Llamar al backend aquí si es necesario
      await fetch(AION_BACKEND_URL, {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });
    }
  });

  return result.toDataStreamResponse();
}
```

## Monitoreo

Vercel proporciona:

1. **Analytics**: Ver tráfico y performance
2. **Logs**: Revisar errores en tiempo real
3. **Speed Insights**: Métricas de rendimiento
4. **Web Vitals**: Core Web Vitals automáticos

Accede en: `https://vercel.com/[tu-usuario]/aion-chat/analytics`

## Dominios Personalizados

Para añadir tu dominio:

1. Ve a **Settings** > **Domains**
2. Añade tu dominio (ej: `chat.tudominio.com`)
3. Configura los DNS según las instrucciones
4. Vercel proveerá SSL automáticamente

## Troubleshooting

### Error: "Backend error: 500"

- Verifica que `AION_BACKEND_URL` esté correctamente configurada
- Revisa que el backend esté en línea y accesible
- Chequea los logs del backend

### Error: "Request timeout"

- El backend está tardando más de 10 segundos
- Considera upgrade a Vercel Pro
- Implementa streaming real

### CORS Error

- Configura CORS en el backend para permitir tu dominio de Vercel
- Añade `https://*.vercel.app` a los orígenes permitidos

### Build Fails

- Verifica que todas las dependencias estén en `package.json`
- Chequea que la versión de Node.js sea compatible (18+)
- Revisa los logs de build en Vercel

## Comandos Útiles

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde línea de comandos
vercel

# Deploy a producción
vercel --prod

# Ver logs en tiempo real
vercel logs

# Ver variables de entorno
vercel env ls
```

## Siguiente Paso: CI/CD

Vercel automáticamente:

1. **Deploys de Preview**: Cada push a una branch crea un preview
2. **Production Deploys**: Cada push a `main` despliega a producción
3. **Rollbacks**: Puedes hacer rollback a cualquier deploy anterior

## Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)
