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
  const [icons, setIcons] = useState<IconInstance[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    // Aumentado para máxima imersão
    const count = isMobile ? 15 : 25;
    const newIcons = [...Array(count)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.8, // Variação maior de tamanho
      size: 20 + Math.random() * 60,   // Variação maior de tamanho
      duration: 20 + Math.random() * 20,
      stroke: 1.5 + Math.random() * 2.5, // Variação de grossura
    }));
    setIcons(newIcons);
  }, []);

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
            ease: "linear", // Linear para movimento mais constante
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

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default React.memo(AnimatedBackground);
