'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AionAiAnimatedLogo from '@/components/aion-ai-animated-logo';

interface VoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceMode({ isOpen, onClose }: VoiceModeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setPermissionGranted(false);
    }
  }, [isOpen]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Inicializar audio context para visualización
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      // Configurar visualización de audio
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const startRecording = async () => {
    // Si no tenemos permisos, solo pedirlos y salir
    if (!permissionGranted || !streamRef.current) {
      await requestPermissions();
      return;
    }

    try {
      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
      };

      // Iniciar grabación y visualización
      mediaRecorder.start();
      visualizeAudio();
      setIsRecording(true);
      setTranscribedText('');
      setResponseText('');
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      alert('Error al iniciar la grabación. Intenta de nuevo.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!isRecording) return;

      analyserRef.current!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255); // Normalizar a 0-1

      requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:8000/chat/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Obtener textos de los headers (vienen en base64)
      const transcribed = response.headers.get('X-Transcribed-Text');
      const responseTextHeader = response.headers.get('X-Response-Text');
      const encoding = response.headers.get('X-Encoding');

      if (transcribed && encoding === 'base64') {
        setTranscribedText(atob(transcribed));
      } else if (transcribed) {
        setTranscribedText(decodeURIComponent(transcribed));
      }

      if (responseTextHeader && encoding === 'base64') {
        setResponseText(atob(responseTextHeader));
      } else if (responseTextHeader) {
        setResponseText(decodeURIComponent(responseTextHeader));
      }

      // Obtener audio de respuesta
      const audioResponseBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioResponseBlob);

      // Reproducir audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }

    } catch (error) {
      console.error('Error al enviar audio:', error);
      alert('Error al procesar el audio. Asegúrate de que el backend esté corriendo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-11 h-11 bg-[#262626] rounded-2xl text-white flex items-center justify-center transition-all hover:bg-white/25 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contenido central */}
          <div className="flex flex-col items-center gap-8">
            {/* Logo animado con pulsación */}
            <motion.div
              animate={{
                scale: isRecording ? [1, 1.1, 1] : isPlaying ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: isRecording || isPlaying ? 1.5 : 0.3,
                repeat: isRecording || isPlaying ? Infinity : 0,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Círculo pulsante de fondo */}
              {(isRecording || isPlaying) && (
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{
                    transform: 'translate(-25%, -25%)',
                    width: '150%',
                    height: '150%',
                  }}
                />
              )}

              {/* Logo */}
              <div className="w-32 h-32 rounded-full bg-white/20 relative z-10">
                <AionAiAnimatedLogo className="w-full h-full" />
              </div>

              {/* Anillo de nivel de audio */}
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary"
                  style={{
                    transform: 'translate(-10%, -10%)',
                    width: '120%',
                    height: '120%',
                    opacity: audioLevel,
                  }}
                />
              )}
            </motion.div>

            {/* Estado y textos */}
            <div className="text-center max-w-2xl px-8">
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-primary text-xl font-semibold mb-2">Escuchando...</p>
                  <p className="text-gray-400 text-sm">Habla con AION</p>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-primary text-xl font-semibold mb-2 aion-typing-animation">
                    Procesando...
                  </p>
                  <p className="text-gray-400 text-sm">AION está pensando</p>
                </motion.div>
              )}

              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-primary text-xl font-semibold mb-2">Respondiendo...</p>
                  <p className="text-gray-400 text-sm">Escucha la respuesta de AION</p>
                </motion.div>
              )}

              {!isRecording && !isProcessing && !isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-white text-xl font-semibold mb-2">Modo Voz</p>
                  <p className="text-gray-400 text-sm">Mantén presionado para hablar</p>
                </motion.div>
              )}

              {/* Mostrar textos transcritos */}
              {transcribedText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <p className="text-xs text-gray-500 mb-1">Tú dijiste:</p>
                  <p className="text-white text-sm">{transcribedText}</p>
                </motion.div>
              )}

              {responseText && !isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <p className="text-xs text-gray-500 mb-1">AION responde:</p>
                  <p className="text-white text-sm">{responseText}</p>
                </motion.div>
              )}
            </div>

            {/* Botón de grabación */}
            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isProcessing || isPlaying}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary hover:bg-primary/80'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <Volume2 className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>

            <p className="text-gray-500 text-xs">
              {isRecording
                ? 'Suelta para enviar'
                : permissionGranted
                  ? 'Presiona y mantén para grabar'
                  : 'Presiona para dar permisos y grabar'}
            </p>
          </div>

          {/* Audio element oculto */}
          <audio
            ref={audioRef}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
