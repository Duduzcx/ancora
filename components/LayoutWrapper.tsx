"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { usePathname, useRouter } from 'next/navigation';
import { Anchor } from 'lucide-react';
import { App } from '@capacitor/app';
import { motion, AnimatePresence } from 'framer-motion';

const publicPages = ['/auth', '/auth/signup', '/auth/forgot-password', '/privacidade'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    const setupDeepLinks = async () => {
      App.addListener('appUrlOpen', async (event: any) => {
        // Aceita tanto o esquema antigo quanto o novo durante a transição
        if (event.url.includes('com.zcx.norica') || event.url.includes('com.zcx.ancora')) {
          if (event.url.includes('access_token') || event.url.includes('code=')) {
            const url = new URL(event.url.replace('#', '?'));
            const code = url.searchParams.get('code');
            
            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
            } else {
              await supabase.auth.getSession();
            }
            // O onAuthStateChange abaixo cuidará de atualizar o estado e redirecionar se necessário
            router.push('/');
          }
        }
      });
    };

    setupDeepLinks();

    const checkAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        const isPublic = publicPages.some(page => pathname?.startsWith(page));
        
        if (!currentSession && !isPublic && pathname !== '/') {
          setTimeout(() => {
            router.push('/');
          }, 100);
        }
      } catch (e) {
        console.error("Erro auth:", e);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white relative">
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                <Anchor className="text-emerald-500 animate-bounce relative z-10" size={56} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando...</p>
          </motion.div>
        ) : (
          /* REMOVED INDIVIDUAL PAGE MOTION TO LET TEMPLATE.TSX HANDLE IT */
          <div className="min-h-screen w-full relative z-0">
            {children}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}