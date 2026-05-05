"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import NavigationDock from './NavigationDock';
import { Anchor } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  // Sincroniza o estado de montagem e autenticação
  useEffect(() => {
    setIsMounted(true);
    
    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      // Mantemos o loading por 800ms para garantir que o Next.js terminou de hidratar o DOM
      setTimeout(() => setIsLoading(false), 800);
    }
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    const setupDeepLink = async () => {
      try {
        await App.addListener('appUrlOpen', async (event) => {
          if (event.url.includes('com.zcx.ancora://login-callback')) {
            try { await Browser.close(); } catch (e) {}
            const url = new URL(event.url);
            const queryString = url.search || url.hash;
            if (queryString) {
              router.push(`/auth/callback${queryString}`);
            }
          }
        });
      } catch (e) {}
    };
    setupDeepLink();

    return () => {
      subscription.unsubscribe();
      try { App.removeAllListeners(); } catch (e) {}
    };
  }, [supabase, router]);

  // Se não estiver montado (Server-Side) ou ainda estiver validando a sessão, mostra Loader fixo.
  // Isso IMPEDE o Next.js de tentar renderizar a página antes da hora e dar o erro de hidratação.
  if (!isMounted || isLoading) {
    return (
      <div className="fixed inset-0 bg-[#080D19] flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
            <Anchor className="text-emerald-500 animate-bounce relative z-10" size={56} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando Nórica...</p>
        </div>
      </div>
    );
  }

  // Lógica de proteção de rotas
  const isAuthRoute = pathname?.startsWith('/auth');
  const isPublicRoute = pathname === '/auth' || pathname === '/auth/signup' || pathname === '/auth/forgot-password';

  return (
    <div className="min-h-[100dvh] bg-slate-50 relative flex flex-col w-full overflow-hidden">
      {/* Background persistente */}
      {isAuthenticated && !isAuthRoute && <AnimatedBackground />}
      
      <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex flex-col w-full relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </main>

        {/* Dock persistente */}
        {isAuthenticated && !isAuthRoute && <NavigationDock />}
      </div>
    </div>
  );
}