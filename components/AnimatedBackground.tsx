"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

interface AnimatedBackgroundProps {
  subtle?: boolean;
}

const AnimatedBackground = ({ subtle = false }: AnimatedBackgroundProps) => {
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
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${subtle ? 'text-slate-900/[0.03]' : 'text-slate-900/10'}`}
          initial={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`, 
            rotate: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          <Anchor size={40 + Math.random() * 60} />
        </motion.div>
      ))}

      {/* Granulação de performance */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default React.memo(AnimatedBackground);
