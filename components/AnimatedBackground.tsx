"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#f8fafc]">
      {/* Malha de Gradiente CSS Estática (Zero CPU) */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)
        `
      }} />

      {/* Apenas 3 Âncoras com movimento ultra-lento via GPU */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-slate-900/5"
          initial={{ 
            top: `${20 + i * 30}%`, 
            left: `${10 + i * 35}%`, 
            rotate: i * 45 
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [i * 45, i * 45 + 5, i * 45],
          }}
          transition={{
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: 'translateZ(0)' }} // Força aceleração de hardware
        >
          <Anchor size={120} />
        </motion.div>
      ))}

      {/* Granulação de performance */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default React.memo(AnimatedBackground);
