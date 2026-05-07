"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { Anchor, Ship, RadioTower, Sailboat, Plus, X, Sword, CheckCircle, Shield, LifeBuoy } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

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
    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4-4v2" />
    <path d="M8 6h8l-1-4h-6z" />
  </svg>
);

const CompassStarIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" fillOpacity="0.2" className="blur-[1px]" />
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
    <path d="M12 6L13.5 10.5L18 12L13.5 13.5L12 18L10.5 13.5L6 12L10.5 10.5L12 6Z" fill="white" fillOpacity="0.4" />
    <g transform="rotate(45 12 12)">
      <path d="M12 5L13.5 10.5L19 12L13.5 13.5L12 19L10.5 13.5L5 12L10.5 10.5L12 5Z" fill="currentColor" fillOpacity="0.6" />
    </g>
    <circle cx="12" cy="12" r="1.8" fill="white" className="animate-pulse shadow-lg" />
  </svg>
);

const sideItemsLeft = [
  { icon: Anchor, label: 'Início', href: '/' },
  { icon: LifeBuoy, label: 'Porto', href: '/porto/' },
];

const sideItemsRight = [
  { icon: LighthouseIcon, label: 'Farol', href: '/farol/', hasNotification: true },
  { icon: SailorIcon, label: 'Perfil', href: '/perfil/' },
];

const hubItems = [
  { icon: CheckCircle, label: 'Logs', href: '/log/', desc: 'Sua Nórica Diária' },
  { icon: Sword, label: 'Arena', href: '/arena/', desc: 'Treinamento Tático' },
  { icon: Shield, label: 'O Cofre', href: '/cofre/', desc: 'Registros Seguros' },
];

export default function NavigationDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  React.useEffect(() => {
    const handleToggle = (e: any) => setIsVisible(e.detail);
    window.addEventListener('toggleDock', handleToggle);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('toggleDock', handleToggle);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsHubOpen(false);
    router.push(href);
  };

  const isExcluded = 
    !user ||
    pathname?.startsWith('/porto') || 
    pathname?.startsWith('/arena') || 
    pathname?.startsWith('/cofre') ||
    !isVisible;

  if (isExcluded) return null;

  return (
    <>
      {/* GLOBAL BLUR WHEN HUB OPEN */}
      <AnimatePresence>
        {isHubOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] bg-white/40 backdrop-blur-md pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-0 right-0 z-[999] px-4 pb-[env(safe-area-inset-bottom,0px)] pointer-events-none">
        <div className="max-w-md mx-auto relative flex flex-col items-center pointer-events-auto">
          
          <AnimatePresence>
            {isHubOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setIsHubOpen(false)}
                  className="fixed inset-0 bg-transparent pointer-events-auto"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6 w-full bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-6 shadow-2xl pointer-events-auto relative z-10"
                >
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 text-center">Menu Expandido</p>
                    {hubItems.map((item) => (
                      <button key={item.href} onClick={(e) => handleNavigate(e, item.href)} className="w-full text-left">
                        <div className="flex items-center gap-4 p-4 rounded-3xl transition-all hover:bg-slate-50">
                          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                            <item.icon size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{item.label}</span>
                            <span className="text-[10px] font-bold text-slate-400">{item.desc}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <nav className="w-full bg-white rounded-[2rem] p-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-around pointer-events-auto h-[4.5rem] border border-slate-100">
            <div className="flex flex-1 justify-around items-center h-full">
              {sideItemsLeft.map((item) => {
                const isActive = pathname === item.href || pathname === item.href.replace(/\/$/, "");
                return (
                  <button key={item.href} onClick={(e) => handleNavigate(e, item.href)} className={`p-3 rounded-full ${isActive ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400'}`}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </button>
                );
              })}
            </div>

            <div className="relative -mt-8 flex justify-center w-20">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isHubOpen ? { rotate: 180 } : { 
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsHubOpen(!isHubOpen)}
                className="w-16 h-16 flex items-center justify-center transition-all text-white relative z-10 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #064e3b)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
              >
                <AnimatePresence mode="wait">
                  {isHubOpen ? (
                    <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <X size={26} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <CompassStarIcon className="w-10 h-10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="flex flex-1 justify-around items-center h-full">
              {sideItemsRight.map((item) => {
                const isActive = pathname === item.href || pathname === item.href.replace(/\/$/, "");
                return (
                  <button key={item.href} onClick={(e) => handleNavigate(e, item.href)} className={`p-3 rounded-full relative ${isActive ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400'}`}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {item.hasNotification && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
