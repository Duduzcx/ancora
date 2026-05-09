"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

interface AnimatedBackgroundProps {
  subtle?: boolean;
}

interface IconInstance {
  id: number;
  top: string;
  left: string;
  rotate: number;
  scale: number;
  size: number;
  duration: number;
}

const AnimatedBackground = ({ subtle = false }: AnimatedBackgroundProps) => {
  const [icons] = useState<IconInstance[]>(() => {
    // Verificação básica de window para evitar erros em SSR
    if (typeof window === 'undefined') return [];
    
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 14 : 20;
    return [...Array(count)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.4 + Math.random() * 0.6,
      size: 20 + Math.random() * 40,
      duration: 25 + Math.random() * 25,
      stroke: 2.5,
    }));
  });

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-slate-50">
      {/* Malha de Gradiente Nórica */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%)
        `
      }} />

      {/* Âncoras flutuantes Verdes */}
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          className={`absolute ${subtle ? 'text-emerald-500/[0.08]' : 'text-emerald-500/[0.15]'}`}
          animate={{
            y: [0, -50, 0],
            x: [0, 20, 0],
            rotate: [icon.rotate, icon.rotate + 20, icon.rotate],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ 
            top: icon.top,
            left: icon.left,
            rotate: icon.rotate,
            scale: icon.scale,
            filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.1))',
            willChange: 'transform'
          }}
        >
          <Anchor size={icon.size} strokeWidth={icon.stroke} />
        </motion.div>
      ))}

      {/* Partículas / Bolhas flutuantes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute rounded-full bg-white/20 blur-[2px]"
          animate={{
            y: [0, -100, 0],
            x: [0, 30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            delay: Math.random() * 10,
          }}
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)'
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(AnimatedBackground);
