"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Wind, Shield, CheckCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface Insight {
  text: string;
  actionLabel: string;
  actionHref: string;
  color: string;
  icon: any;
  type: 'calm' | 'alert' | 'info';
}

export default function FarolCompanion() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Simulação de dados (posteriormente virão do Supabase/LocalStorage)
  useEffect(() => {
    const generateInsight = () => {
      // Mock de dados para demonstração
      const completedTasks = { corpo: 2, mente: 0, ambiente: 1 };
      const currentMood = "Agitado"; // Exemplo: Agitado, Calmo, Ansioso
      const streakDays = 4;
      const hour = new Date().getHours();

      // Lógica de "Intuição"
      if (currentMood === "Agitado") {
        return {
          text: "Senti que o mar está agitado por aí. O Cofre está aberto se precisar descarregar o peso do que está sentindo.",
          actionLabel: "Ir para o Cofre",
          actionHref: "/cofre",
          color: "bg-orange-400",
          icon: Shield,
          type: 'alert' as const
        };
      }

      if (completedTasks.mente === 0 && completedTasks.corpo > 0) {
        return {
          text: "Notei que você cuidou bem do corpo hoje. Que tal 2 minutos de silêncio para a mente agora?",
          actionLabel: "Respirar Agora",
          actionHref: "/porto?humor=calmo", // Redireciona para um exercício ou chat calmo
          color: "bg-emerald-400",
          icon: Wind,
          type: 'calm' as const
        };
      }

      if (streakDays > 3) {
        return {
          text: `Sua resiliência é inspiradora. ${streakDays} dias seguidos mantendo a sua âncora firme em solo seguro.`,
          actionLabel: "Ver Farol",
          actionHref: "/farol",
          color: "bg-blue-400",
          icon: CheckCircle,
          type: 'info' as const
        };
      }

      if (hour < 10) {
        return {
          text: "Um novo dia, um novo oceano. Qual será a sua primeira pequena vitória hoje?",
          actionLabel: "Abrir Logs",
          actionHref: "/log",
          color: "bg-emerald-400",
          icon: Sparkles,
          type: 'calm' as const
        };
      }

      return {
        text: "O Farol está atento ao seu trajeto. Tudo parece calmo por enquanto. Mantenha o curso.",
        actionLabel: "Ver Insights",
        actionHref: "/farol",
        color: "bg-emerald-400",
        icon: Lightbulb,
        type: 'calm' as const
      };
    };

    setInsight(generateInsight());
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!insight) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="relative group">
            {/* Efeito de brilho suave de fundo */}
            <div className={`absolute -inset-1 ${insight.color} opacity-10 blur-2xl rounded-[3rem] group-hover:opacity-20 transition-opacity`} />
            
            <div className="relative bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
              
              {/* Indicador Visual (O Olho do Farol) */}
              <div className="relative flex-none">
                <motion.div
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className={`w-4 h-4 rounded-full ${insight.color} blur-[2px]`}
                />
                <div className={`absolute inset-0 w-4 h-4 rounded-full ${insight.color} shadow-lg`} />
              </div>

              {/* Conteúdo do Insight */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <Sparkles size={12} className={insight.type === 'alert' ? 'text-orange-400' : 'text-emerald-400'} />
                  Intuição do Farol
                </div>
                <p className="text-slate-700 text-lg md:text-xl font-medium leading-tight tracking-tight">
                  {insight.text}
                </p>
              </div>

              {/* Botão de Ação Contextual */}
              <div className="flex-none w-full md:w-auto">
                <Link href={insight.actionHref}>
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      w-full px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                      ${insight.type === 'alert' 
                        ? 'bg-slate-900 text-white shadow-xl hover:bg-slate-800' 
                        : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md'}
                    `}
                  >
                    <insight.icon size={16} />
                    {insight.actionLabel}
                    <ArrowRight size={14} className="opacity-50" />
                  </motion.button>
                </Link>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
