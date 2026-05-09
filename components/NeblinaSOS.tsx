import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeblinaSOSProps {
  onClareou: () => void;
}

// Sub-componente para gerenciar os dois vídeos em crossfade de forma precisa
function SeamlessVideo({ src }: { src: string }) {
  const v1Ref = useRef<HTMLVideoElement>(null);
  const v2Ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(1);

  useEffect(() => {
    const checkLoop = setInterval(() => {
      const v1 = v1Ref.current;
      const v2 = v2Ref.current;
      if (!v1 || !v2) return;

      const current = active === 1 ? v1 : v2;
      const next = active === 1 ? v2 : v1;

      // Se o atual está chegando ao fim (faltando 0.6s para uma transição bem suave)
      if (current.duration > 0 && current.duration - current.currentTime < 0.6) {
        if (next.paused) {
          next.currentTime = 0;
          next.play().catch(() => {});
          setActive(active === 1 ? 2 : 1);
        }
      }
    }, 50); // Checa a cada 50ms para precisão maxima

    return () => clearInterval(checkLoop);
  }, [active]);

  return (
    <div className="absolute inset-0 z-0">
      <video 
        ref={v1Ref}
        autoPlay 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] brightness-[0.4]"
        style={{ opacity: active === 1 ? 1 : 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video 
        ref={v2Ref}
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] brightness-[0.4]"
        style={{ opacity: active === 2 ? 1 : 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

export default function NeblinaSOS({ onClareou }: NeblinaSOSProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCleared, setIsCleared] = useState(false);
  const [rubCount, setRubCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Efeito de névoa texturizada
    ctx.fillStyle = '#2d3748'; // Cor base da névoa
    ctx.globalAlpha = 0.95;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = '#4a5568';
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 100, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const handleEsfregar = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isCleared) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();

    setRubCount(prev => {
      const newCount = prev + 1;
      if (newCount > 250 && !isCleared) setIsCleared(true);
      return newCount;
    });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black overflow-hidden flex items-center justify-center">
      
      <SeamlessVideo src="/mar.mp4" />

      {/* CAMADA 2: SOMBRA DE RODAPÉ (GROUNDING) */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {/* CAMADA 3: CANVAS DA NEBLINA */}
      <AnimatePresence>
        {!isCleared && (
          <motion.canvas
            ref={canvasRef}
            onTouchMove={handleEsfregar}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 2.5 }}
            className="absolute inset-0 z-20 cursor-none touch-none"
          />
        )}
      </AnimatePresence>

      {/* INTERFACE PÓS-LIMPEZA */}
      {isCleared && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-50 p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/20 text-center max-w-xs shadow-2xl mx-6"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Horizonte à vista</h2>
          <p className="text-gray-200 mb-8 font-medium">A tempestade deu trégua. O Porto seguro espera por ti.</p>
          <button 
            onClick={onClareou}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg shadow-emerald-900/40"
          >
            Entrar no Porto
          </button>
        </motion.div>
      )}

      {!isCleared && (
        <div className="absolute top-1/3 z-30 text-center w-full pointer-events-none px-6">
          <p className="text-white/60 text-lg font-black tracking-[0.3em] uppercase animate-pulse italic">
            Limpa o horizonte...
          </p>
        </div>
      )}
    </div>
  );
}
