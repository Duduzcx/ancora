"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

interface AnimatedBackgroundProps {
  subtle?: boolean;
}

interface AnchorInstance {
  id: number;
  top: string;
  left: string;
  rotate: number;
  scale: number;
  size: number;
  duration: number;
}

const AnimatedBackground = ({ subtle = false }: AnimatedBackgroundProps) => {
  const [anchors, setAnchors] = useState<AnchorInstance[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 30;
    const newAnchors = [...Array(count)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      size: 40 + Math.random() * 60,
      duration: 15 + Math.random() * 10,
    }));
    setAnchors(newAnchors);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#f8fafc]">
      {/* Malha de Gradiente CSS Estática */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)
        `
      }} />

      {/* Frota de 30 Âncoras */}
      {anchors.map((anchor) => (
        <motion.div
          key={anchor.id}
          className={`absolute ${subtle ? 'text-slate-900/[0.03]' : 'text-slate-900/10'}`}
          initial={{ 
            top: anchor.top, 
            left: anchor.left, 
            rotate: anchor.rotate,
            scale: anchor.scale
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [anchor.rotate, anchor.rotate + 10, anchor.rotate],
          }}
          transition={{
            duration: anchor.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          <Anchor size={anchor.size} />
        </motion.div>
      ))}

      {/* Granulação de performance */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default React.memo(AnimatedBackground);
