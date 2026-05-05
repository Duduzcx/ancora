"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AppLogo({ size = 40, className = "" }) {
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ rotate: -10 }}
      animate={{ rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Camada de Brilho Externo */}
      <path 
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" 
        fill="currentColor" 
        fillOpacity="0.2"
        className="blur-[2px]"
      />
      {/* Estrela de 8 pontas (Bússola) Principal */}
      <path 
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" 
        fill="currentColor" 
      />
      <path 
        d="M12 6L13.5 10.5L18 12L13.5 13.5L12 18L10.5 13.5L6 12L10.5 10.5L12 6Z" 
        fill="white" 
        fillOpacity="0.5" 
      />
      {/* Pontas secundárias (NE, NW, SE, SW) */}
      <g transform="rotate(45 12 12)">
        <path 
          d="M12 5L13.5 10.5L19 12L13.5 13.5L12 19L10.5 13.5L5 12L10.5 10.5L12 5Z" 
          fill="currentColor" 
          fillOpacity="0.7" 
        />
      </g>
      {/* Núcleo brilhante */}
      <circle cx="12" cy="12" r="1.5" fill="white" className="shadow-lg" />
    </motion.svg>
  );
}
