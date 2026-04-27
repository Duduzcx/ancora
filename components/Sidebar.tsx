"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, MessageCircle, Sword, 
  CheckCircle, Shield, LogOut, UserPlus, User, 
  Lightbulb, Menu, X 
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const menuItems = [
  { icon: MessageCircle, label: 'O Porto', href: '/porto' },
  { icon: Sword, label: 'A Arena', href: '/arena' },
  { icon: CheckCircle, label: 'Logs de sobrevivencia', href: '/log' },
  { icon: Shield, label: 'O Cofre', href: '/cofre' },
  { icon: Lightbulb, label: 'O Farol', href: '/farol' },
  { icon: User, label: 'Perfil', href: '/perfil' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  const isPorto = pathname?.startsWith('/porto');

  const fetchUser = async (sessionUser: any) => {
    if (sessionUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', sessionUser.id)
        .maybeSingle();
      
      let displayName = profile?.display_name || 
                          sessionUser.user_metadata?.display_name || 
                          sessionUser.email?.split('@')[0] || 
                          'Usuário';

      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      setUser({ 
        ...sessionUser, 
        display_name: displayName
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user);
    });

    menuItems.forEach(item => {
      router.prefetch(item.href);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Listener para abrir o menu a partir de outras páginas
  useEffect(() => {
    const handleOpen = () => setIsMobileMenuOpen(true);
    window.addEventListener('open-main-sidebar', handleOpen);
    return () => window.removeEventListener('open-main-sidebar', handleOpen);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  if (!isMounted) return null;


  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 md:bg-white/40 backdrop-blur-xl md:backdrop-blur-md border-r border-white/40">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-slate-900 text-emerald-400 rounded-xl group-hover:rotate-12 transition-transform">
            <Anchor size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">Âncora</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div 
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-xl translate-x-2' 
                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/20">
        {user ? (
          <motion.div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                {user.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-black text-slate-900 truncate">
                  {user.display_name}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online</span>
              </div>
            </div>
            <motion.button 
              whileHover={{ x: 3, color: '#ef4444' }}
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 transition-colors font-bold text-sm"
            >
              <LogOut size={18} />
              Sair
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="px-4 py-6 bg-slate-900 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform">
                <Anchor size={60} />
              </div>
              <div className="relative z-10 space-y-3">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Aviso de Navegação</p>
                <p className="text-white text-xs font-bold leading-relaxed">
                  Sua jornada não está sendo salva. Crie uma conta para guardar suas pérolas e progresso.
                </p>
              </div>
            </div>
            <Link href="/auth">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                <UserPlus size={18} />
                Entrar / Criar
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const isFullPage = pathname?.startsWith("/porto") || pathname?.startsWith("/arena") || pathname?.startsWith("/cofre") || pathname === "/auth";

  return (
    <>
      {/* HEADER MOBILE (Hides on full-page routes like Porto/Arena) */}
      {!isFullPage && (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-md border-b border-white/40 z-[60] flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 rounded-lg text-emerald-400">
              <Anchor size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">Ancora</span>
          </Link>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>
      )}

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 flex-col z-50">
        <SidebarContent />
      </aside>

      {/* SIDEBAR MOBILE (OVERLAY) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-[70] lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Espaçador para o conteúdo não ficar atrás do header mobile (SÓ APARECE SE O HEADER APARECER) */}
      {!isFullPage && <div className="lg:hidden h-16 w-full" />}
    </>
  );
}
