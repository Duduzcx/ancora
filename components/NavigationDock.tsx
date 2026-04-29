"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Anchor, Ship, RadioTower, Sailboat, Plus, X, Sword, CheckCircle, Shield, LifeBuoy } from 'lucide-react';

const LighthouseIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 9h8" />
    <path d="M9 14h6" />
    <path d="M12 3l2 3h-4l2-3z" />
    <path d="M10 6L8 21h8l-2-15" />
    <path d="M3 21h18" />
  </svg>
);

const SailorIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="4" />
    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
    <path d="M8 6h8l-1-4h-6z" />
  </svg>
);

const sideItemsLeft = [
  { icon: Anchor, label: 'Início', href: '/' },
  { icon: LifeBuoy, label: 'Porto', href: '/porto' },
];

const sideItemsRight = [
  { icon: LighthouseIcon, label: 'Farol', href: '/farol', hasNotification: true },
  { icon: SailorIcon, label: 'Perfil', href: '/perfil' },
];

const hubItems = [
  { icon: CheckCircle, label: 'Logs', href: '/log', desc: 'Sua Âncora Diária' },
  { icon: Sword, label: 'Arena', href: '/arena', desc: 'Treinamento Tático' },
  { icon: Shield, label: 'O Cofre', href: '/cofre', desc: 'Registros Seguros' },
];

export default function NavigationDock() {
  const pathname = usePathname();
  const [isHubOpen, setIsHubOpen] = useState(false);

  // Não renderiza o menu no /porto, /cofre ou /arena para não atrapalhar
  if (pathname?.startsWith('/porto') || pathname?.startsWith('/cofre') || pathname?.startsWith('/arena')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pointer-events-none">
      <div className="max-w-md mx-auto relative flex flex-col items-center">
        
        {/* Popover do Hub */}
        <AnimatePresence>
          {isHubOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHubOpen(false)}
                className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm pointer-events-auto"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="mb-6 w-full bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] p-6 shadow-2xl pointer-events-auto relative z-10"
              >
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 text-center">Menu Expandido</p>
                  {hubItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setIsHubOpen(false)}>
                      <motion.div 
                        whileHover={{ x: 5, backgroundColor: 'rgba(0,0,0,0.02)' }}
                        className="flex items-center gap-4 p-4 rounded-3xl transition-all"
                      >
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                          <item.icon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{item.label}</span>
                          <span className="text-[10px] font-bold text-slate-400">{item.desc}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Barra Inferior (The Dock) */}
        <motion.nav 
          className="w-full bg-white rounded-[2rem] p-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-around pointer-events-auto h-[4.5rem] border border-slate-100"
        >
          {/* Lado Esquerdo */}
          <div className="flex flex-1 justify-around items-center h-full">
            {sideItemsLeft.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="relative group" onClick={() => setIsHubOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center p-3 rounded-full transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}
                  >
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Botão Central (O Leme / Hexagon) */}
          <div className="relative -mt-8 flex justify-center w-20">
            {/* Hexagon Drop Shadow hack */}
            <div 
              className="absolute top-2 left-2 right-2 bottom-2 bg-emerald-500 blur-md opacity-40 -z-10" 
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            <motion.button
              onClick={() => setIsHubOpen(!isHubOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 flex items-center justify-center transition-all text-white relative z-10"
              style={{
                background: 'linear-gradient(135deg, #34d399, #059669)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            >
              <motion.div
                animate={{ rotate: isHubOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {isHubOpen ? <X size={26} strokeWidth={3} /> : <Plus size={26} strokeWidth={3} />}
              </motion.div>
            </motion.button>
          </div>

          {/* Lado Direito */}
          <div className="flex flex-1 justify-around items-center h-full">
            {sideItemsRight.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="relative group" onClick={() => setIsHubOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center p-3 rounded-full transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}
                  >
                    <div className="relative">
                      <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      {item.hasNotification && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff4d6d] rounded-full border-2 border-white" />
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </div>
  );
}
