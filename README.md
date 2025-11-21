# AION Chat - Frontend Moderno

Interfaz de chat moderna y elegante construida con Next.js 16, AI SDK, shadcn/ui y Tailwind CSS 4 que hace proxy completo al backend de AION Agent (FastAPI + LangGraph + Groq).

## Características

- 🎨 **Diseño Glassmorphism** - Interfaz moderna con efectos de cristal y gradientes
- 🚀 **100% Backend Proxy** - No requiere API keys en el frontend, todo va al backend
- ✨ **Animaciones Fluidas** - Transiciones suaves y micro-interacciones
- 💬 **Chat Intuitivo** - Mensajes con avatares y burbujas de colores
- 📱 **Responsive** - Diseño adaptable a cualquier dispositivo
- ⚡ **Turbopack** - Desarrollo ultra rápido
- 🎯 **Sugerencias Inteligentes** - Preguntas de ejemplo para empezar
- 🌈 **Gradientes Dinámicos** - Colores vibrantes en todo el UI

## Stack Tecnológico

- **Next.js 16.0.3** - Framework de React con App Router
- **AI SDK v6 (5.0.97)** - Streaming y manejo de LLMs
- **React 19** - Última versión de React
- **shadcn/ui** - Componentes de UI
- **Tailwind CSS 4** - Estilos
- **TypeScript 5** - Type safety
- **pnpm** - Package manager

## Requisitos Previos

1. **Node.js 18+** instalado
2. **pnpm** instalado (`npm install -g pnpm`)
3. **Backend AION Agent** corriendo en `http://localhost:8000`
4. **Qdrant** corriendo (para el backend)
5. ~~**NO se requiere API Key de OpenAI en el frontend**~~ ✅

## Instalación

### 1. Instalar dependencias

```bash
cd aion-chat
pnpm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# OpenAI API Key para el modelo del frontend
OPENAI_API_KEY=sk-tu-api-key-aqui

# URL del backend de AION Agent
AION_BACKEND_URL=http://localhost:8000
```

### 3. Asegúrate de que el backend esté corriendo

```bash
# En otra terminal, en la carpeta aionagent
cd ../aionagent
uv run main.py
```

El backend debe estar disponible en `http://localhost:8000`

### 4. Asegúrate de que Qdrant esté corriendo

```bash
# Desde la raíz del proyecto aion
cd ..
docker-compose up -d
```

## Uso

### Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Build de producción

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## Arquitectura

### Flujo de datos

1. **Usuario** → Escribe mensaje en la interfaz
2. **Frontend** → Envía mensaje a `/api/chat` (Next.js API Route)
3. **API Route** → Usa AI SDK para streaming con GPT-4o-mini
4. **Tool Call** → Cuando el modelo necesita información, llama a `searchKnowledgeBase`
5. **Backend** → La tool hace una request a `http://localhost:8000/chat` (FastAPI)
6. **AION Agent** → Busca en Qdrant y responde
7. **Frontend** → Muestra la respuesta con streaming en tiempo real

### Estructura de carpetas

```
aion-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route con AI SDK
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx    # Componente principal del chat
│   │   └── message.tsx           # Componente de mensajes
│   └── ui/                       # Componentes de shadcn/ui
├── lib/
│   └── utils.ts                  # Utilidades
├── .env.local                    # Variables de entorno
├── components.json               # Config de shadcn
├── next.config.ts                # Config de Next.js
├── tailwind.config.ts            # Config de Tailwind
└── tsconfig.json                 # Config de TypeScript
```

## Componentes Principales

### ChatInterface (`components/chat/chat-interface.tsx`)

Componente principal que maneja:
- Hook `useChat` de AI SDK
- Estado de streaming
- Envío de mensajes
- Scroll automático
- Manejo de errores

### ChatMessage (`components/chat/message.tsx`)

Renderiza diferentes tipos de partes de mensaje:
- **Text parts** - Texto normal del mensaje
- **Reasoning parts** - Proceso de razonamiento (colapsable)
- **Tool parts** - Visualización de tool calls con estados:
  - `input-streaming` - Cargando argumentos
  - `input-available` - Ejecutando
  - `output-available` - Completado
  - `output-error` - Error

### API Route (`app/api/chat/route.ts`)

- Usa `streamText` de AI SDK
- Define tool `searchKnowledgeBase`
- Hace proxy al backend FastAPI
- Streaming con `toUIMessageStreamResponse()`

## Características Técnicas

### Streaming

El streaming funciona mediante Server-Sent Events (SSE):

```typescript
const result = streamText({
  model: openai('gpt-4o-mini'),
  messages: convertToModelMessages(messages),
  tools: { searchKnowledgeBase },
  maxSteps: 5,
});

return result.toUIMessageStreamResponse();
```

### Tool Calls

Las herramientas se definen con Zod schemas:

```typescript
searchKnowledgeBase: tool({
  description: 'Busca en la base de conocimiento',
  inputSchema: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    // Llamada al backend
    const response = await fetch(`${AION_BACKEND_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: query }),
    });
    return response.json();
  },
}),
```

### Visualización de Estados

Los mensajes se muestran con diferentes estados visuales:

- **Usuario** - Fondo azul, alineado a la derecha
- **Asistente** - Fondo gris, alineado a la izquierda
- **Tool Calls** - Card amarillo con detalles de entrada/salida
- **Reasoning** - Card morado colapsable
- **Streaming** - Indicador de "typing"

## Troubleshooting

### Error: "Backend error: 500"

- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa los logs del backend para ver el error específico

### Error: "OPENAI_API_KEY is not set"

- Asegúrate de que `.env.local` existe
- Verifica que contiene `OPENAI_API_KEY=sk-...`
- Reinicia el servidor de desarrollo después de cambiar `.env.local`

### No se muestran los tool calls

- Verifica que el backend responde correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que Qdrant está corriendo

### El streaming no funciona

- Verifica que `maxDuration = 30` esté en la API route
- Revisa que no haya firewalls bloqueando SSE
- Comprueba la consola del navegador

## Desarrollo

### Añadir nuevos componentes de shadcn

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Añadir nuevas tools

Edita `app/api/chat/route.ts` y añade nuevas tools al objeto `tools`:

```typescript
tools: {
  searchKnowledgeBase: tool({...}),
  newTool: tool({
    description: 'Nueva herramienta',
    inputSchema: z.object({...}),
    execute: async (input) => {...},
  }),
}
```

### Personalizar estilos

Edita `app/globals.css` para cambiar colores y variables CSS.

## Próximos Pasos

- [ ] Añadir autenticación
- [ ] Guardar historial de conversaciones
- [ ] Añadir más visualizaciones para diferentes tipos de datos
- [ ] Implementar modo oscuro personalizado
- [ ] Añadir analytics
- [ ] Optimizar performance con React.memo
- [ ] Añadir tests con Vitest

## Recursos

- [AI SDK Docs](https://sdk.vercel.ai)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## Licencia

MIT
