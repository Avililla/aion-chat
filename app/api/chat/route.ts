export const maxDuration = 30;

// URL del backend FastAPI de AION Agent
const AION_BACKEND_URL = process.env.AION_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Obtener el último mensaje del usuario
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || lastMessage?.text || '';

    console.log('📨 Enviando al backend:', userMessage);

    // Llamar al backend de AION Agent
    const response = await fetch(`${AION_BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        model: 'openai/gpt-oss-20b',
        reasoning_effort: 'medium'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta del backend:', data);

    // Retornar en formato compatible con useChat
    return Response.json({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: data.response || 'No recibí respuesta del backend.'
    });

  } catch (error) {
    console.error('❌ Error en /api/chat:', error);

    return Response.json(
      {
        error: `Error al conectar con el backend: ${error}`
      },
      { status: 500 }
    );
  }
}
