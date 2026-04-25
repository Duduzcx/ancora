"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Anchor, MessageCircle, Sword, 
  CheckCircle, Shield, LogOut, UserPlus, User, Lightbulb 
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

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
  const supabase = createClient();

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

      // Capitaliza a primeira letra
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
    // Check inicial ultrarrápido via sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user);
    });

    // Pré-carrega rotas principais para navegação instantânea
    menuItems.forEach(item => {
      router.prefetch(item.href);
    });

    // Escuta mudanças (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  if (pathname === '/porto') return null;

  return (
    <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 flex-col bg-white/40 backdrop-blur-md border-r border-white/40 z-50">
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
                <span>{item.label}</span>
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                {user.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">
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
        )}
      </div>
    </aside>
  );
}
