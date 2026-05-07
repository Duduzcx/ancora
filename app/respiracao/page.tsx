"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function RespiracaoPage() {
  const router = useRouter();

  return (
    <main className="min-h-[100dvh] bg-white relative flex flex-col items-center justify-center overflow-hidden overscroll-none touch-none">
      <AnimatedBackground subtle />
      
      {/* Back Button for non-tab navigation context */}
      <button 
        onClick={() => router.back()}
        className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-6 p-4 bg-slate-50 rounded-full text-slate-400 hover:text-emerald-500 transition-colors z-50"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="relative z-10 text-center space-y-8 px-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight italic">Respiração.</h1>
          <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
            Sincronize-se com o ritmo da Nórica.
          </p>
        </div>

        <div className="relative flex items-center justify-center w-full max-w-sm aspect-square mx-auto">
          {/* Outer glow aura */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-emerald-400 rounded-full blur-[80px]"
          />

          {/* Pulsing Circle */}
          <motion.div
            animate={{ 
              scale: [1, 1.7, 1],
              backgroundColor: ['rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.05)'],
              boxShadow: [
                '0 0 50px rgba(16, 185, 129, 0.1)',
                '0 0 120px rgba(16, 185, 129, 0.5)',
                '0 0 50px rgba(16, 185, 129, 0.1)'
              ]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-emerald-500/30 flex items-center justify-center relative z-10"
          >
            <motion.div
              animate={{
                scale: [0.8, 1.4, 0.8],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl border border-slate-50"
            >
              <Anchor size={64} className="text-emerald-500" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-4 pt-10">
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]"
          >
            Inspire • Segure • Expire
          </motion.p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
