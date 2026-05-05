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
    const count = isMobile ? 6 : 15;
    const newIcons = [...Array(count)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      size: 30 + Math.random() * 40,
      duration: 20 + Math.random() * 15,
    }));
    setIcons(newIcons);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Malha de Gradiente Nórica */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.2) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.2) 0px, transparent 50%)
        `
      }} />

      {/* Âncoras flutuantes */}
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          className={`absolute ${subtle ? 'text-emerald-500/[0.1]' : 'text-emerald-500/[0.2]'}`}
          animate={{
            y: [0, -60, 0],
            rotate: [icon.rotate, icon.rotate + 30, icon.rotate],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ 
            top: icon.top,
            left: icon.left,
            rotate: icon.rotate,
            scale: icon.scale,
            filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.05))',
            willChange: 'transform'
          }}
        >
          <Anchor size={icon.size} strokeWidth={3} />
        </motion.div>
      ))}

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default React.memo(AnimatedBackground);
