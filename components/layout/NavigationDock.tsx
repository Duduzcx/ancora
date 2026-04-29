"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Sword, Zap } from 'lucide-react';

const dockItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: MessageSquare, label: 'Logs', href: '/log' },
  { icon: Sword, label: 'Arena', href: '/arena' },
  { icon: Zap, label: 'Farol', href: '/farol' },
];

export default function NavigationDock() {
  const pathname = usePathname();

  // Hide on Auth pages
  if (pathname === '/auth') return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <nav className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] px-4 py-3 flex items-center justify-around relative overflow-hidden">
        {dockItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative group flex flex-col items-center gap-1"
            >
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  p-3 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? 'bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'}
                `}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'opacity-100 text-emerald-400' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="dock-indicator"
                  className="absolute -top-1 w-1 h-1 bg-emerald-400 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
