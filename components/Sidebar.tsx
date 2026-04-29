"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

/**
 * Sidebar agora é um componente invisível que gerencia apenas a lógica de sessão.
 * A navegação foi movida integralmente para o NavigationDock (The Dock).
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    
    // Check de sessão inicial rápido
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Prefetch global apenas uma vez
    const routes = ['/', '/log', '/arena', '/farol', '/cofre', '/perfil'];
    routes.forEach(route => router.prefetch(route));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);


  if (!isMounted) return null;

  return null; // O Sidebar visual foi removido conforme a nova arquitetura de navegação.
}
