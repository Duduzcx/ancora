"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Anchor } from "lucide-react";
import { App } from "@capacitor/app";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import NavigationDock from "@/components/NavigationDock";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. O VIGIA DE DEEP LINKS (PKCE)
    const handleUrlOpen = async (event: any) => {
      console.log("ZCX_LOG: URL recebida no App ->", event.url);
      try {
        const urlStr = event.url;
        if (!urlStr) return;
        
        const url = new URL(urlStr.replace('#', '?'));
        const code = url.searchParams.get('code');

        if (code) {
          console.log("ZCX_LOG: Código PKCE detectado. Trocando por sessão...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("ZCX_LOG: Erro na troca do código ->", error.message);
          } else if (data.session) {
            console.log("ZCX_LOG: Sessão ancorada com sucesso!");
            
            // Inicialização de perfil
            const user = data.session.user;
            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
            const firstName = fullName.split(" ")[0] || user.email?.split("@")[0] || "Amigo";

            const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
            if (!existing) {
              await supabase.from('profiles').insert({ 
                id: user.id, 
                display_name: firstName, 
                updated_at: new Date().toISOString() 
              });
            }

            setIsAuthenticated(true);
            router.push('/');
            router.refresh();
          }
        }
      } catch (e) {
        console.error("ZCX_LOG: Deep Link Processing Error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    App.addListener('appUrlOpen', handleUrlOpen);

    // 2. VERIFICAÇÃO INICIAL (F5 OU ABERTURA)
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session && pathname !== "/auth") {
        router.replace("/auth");
      }
      
      // Delay pequeno para suavizar a splash
      setTimeout(() => setIsLoading(false), 800);
    };

    checkUser();
    window.addEventListener('focus', checkUser);

    // 3. MONITOR DE ESTADO
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsAuthenticated(!!session);
      if (!session && pathname !== "/auth") {
        router.replace("/auth");
      }
    });

    return () => {
      App.removeAllListeners();
      subscription.unsubscribe();
      window.removeEventListener('focus', checkUser);
    };
  }, [pathname, router]);

  return (
    <main className="relative min-h-[100dvh] bg-[#0f172a] overflow-hidden">
      <AnimatePresence mode="wait">
        {(isLoading && pathname !== "/auth") && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a] text-white"
          >
            <div className="flex flex-col items-center gap-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full scale-150" />
                <Anchor size={72} className="text-[#10b981] relative z-10" strokeWidth={2.5} />
              </motion.div>
              
              <div className="flex flex-col items-center gap-2">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[12px] font-black tracking-[0.5em] uppercase text-emerald-400"
                >
                  Ancorando
                </motion.span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full h-full">
        {isAuthenticated && <Sidebar />}
        <div className={isAuthenticated ? "pb-24" : ""}>
          {children}
        </div>
        {isAuthenticated && <NavigationDock />}
      </div>
    </main>
  );
}