# Quick Start - AION Chat 🚀

Guía rápida para poner en marcha el frontend de AION Chat.

## Pasos Rápidos

### 1. Variables de entorno (Ya configuradas ✅)

```bash
# El archivo .env.local ya está configurado
# Solo apunta a tu backend en localhost:8000
# NO se requiere API Key de OpenAI en el frontend
```

### 2. Iniciar el backend (en otra terminal)

```bash
# Asegúrate de que Qdrant está corriendo
cd ..
docker-compose up -d

# Inicia el backend de AION Agent
cd aionagent
uv run main.py
```

### 3. Iniciar el frontend

```bash
cd aion-chat
pnpm dev
```

Abre: **http://localhost:3000**

## Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build
pnpm start

# Linting
pnpm lint

# Añadir componentes de shadcn
pnpm dlx shadcn@latest add [component]

# Actualizar dependencias
pnpm update
```

## Verificar que todo funciona

1. **Frontend**: http://localhost:3000 - Deberías ver la interfaz de chat
2. **Backend**: http://localhost:8000/docs - Documentación de FastAPI
3. **Qdrant**: http://localhost:6333/dashboard - Dashboard de Qdrant

## Preguntas de Ejemplo

Una vez que todo esté corriendo, prueba estas preguntas:

- ¿Qué es NAD+?
- ¿Cuáles son los beneficios de Muscle+?
- ¿Qué productos tenéis disponibles?
- Información sobre Magnesio 5
- ¿Para qué sirve el vademecum?

## Troubleshooting Rápido

### Error de conexión con el backend

```bash
# Verifica que el backend está corriendo
curl http://localhost:8000/health

# Debería responder con JSON
```

### Error de Qdrant

```bash
# Verifica que Qdrant está corriendo
docker ps | grep qdrant

# Si no está, inicia docker-compose
docker-compose up -d
```

### El chat no responde

1. Abre la consola del navegador (F12) y busca errores
2. Verifica los logs del backend
3. Asegúrate de que la API key de OpenAI es válida

## Arquitectura Rápida

```
Usuario → Frontend (Next.js)
           ↓
        API Route (/api/chat)
           ↓
        GPT-4o-mini (OpenAI)
           ↓
        Tool: searchKnowledgeBase
           ↓
        Backend (FastAPI)
           ↓
        AION Agent (LangGraph)
           ↓
        Qdrant (Vector DB)
```

## Características Clave

- ✅ **Streaming**: Respuestas en tiempo real
- ✅ **Tool Calls**: Visualización de herramientas
- ✅ **RAG**: Búsqueda en base de conocimiento
- ✅ **Modern UI**: shadcn/ui + Tailwind
- ✅ **Type Safe**: TypeScript completo

## Próximos Pasos

1. Personaliza los colores en `app/globals.css`
2. Añade más tools en `app/api/chat/route.ts`
3. Mejora los mensajes de bienvenida
4. Añade autenticación
5. Despliega en Vercel

¡Listo! 🚀
