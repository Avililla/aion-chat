export const maxDuration = 60;

// URL del backend FastAPI de AION Agent
const AION_BACKEND_URL = process.env.AION_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    console.log('🎤 Enviando audio al backend:', AION_BACKEND_URL);

    // Reenviar al backend
    const response = await fetch(`${AION_BACKEND_URL}/chat/voice`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      throw new Error(`Backend error: ${response.status}`);
    }

    // Obtener headers del backend
    const transcribed = response.headers.get('X-Transcribed-Text');
    const responseTextHeader = response.headers.get('X-Response-Text');
    const encoding = response.headers.get('X-Encoding');

    // Obtener el audio blob
    const audioBlob = await response.blob();

    // Crear response con los headers
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    if (transcribed) headers.set('X-Transcribed-Text', transcribed);
    if (responseTextHeader) headers.set('X-Response-Text', responseTextHeader);
    if (encoding) headers.set('X-Encoding', encoding);

    return new Response(audioBlob, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error en /api/chat/voice:', error);

    return Response.json(
      {
        error: `Error al conectar con el backend: ${error}`
      },
      { status: 500 }
    );
  }
}
