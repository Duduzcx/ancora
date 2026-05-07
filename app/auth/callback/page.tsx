"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Anchor } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Pegar o código de troca ou o erro da URL
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        console.error("Auth Error:", error, errorDescription);
        router.push(`/?error=${encodeURIComponent(errorDescription || error)}`);
        return;
      }

      if (code) {
        // 2. Trocar o código pela sessão
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          // Sucesso! Agora tenta voltar para o app via Deep Link ou redirecionamento interno
          // Se estivermos no navegador (mobile), o Capacitor vai interceptar isso
          router.push("/");
        } else {
          console.error("Exchange Error:", exchangeError);
          router.push(`/?error=${encodeURIComponent(exchangeError.message)}`);
        }
      } else {
        // 3. Fallback: Verificar se já existe sessão (ex: login via magic link/hash)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push("/");
        } else {
          // Se nada funcionar, volta para a home para tentar login manual
          router.push("/");
        }
      }
    };

    handleCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center p-6 bg-[#080D19] overflow-hidden">
      <AnimatedBackground subtle />
      
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="w-24 h-24 bg-[#00D88B]/10 rounded-[2.5rem] border border-[#00D88B]/20 flex items-center justify-center relative">
          <div className="absolute inset-0 border-4 border-[#00D88B]/30 border-t-[#00D88B] rounded-[2.5rem] animate-spin" />
          <Anchor size={40} className="text-[#00D88B]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Sincronizando</h2>
          <p className="text-[#00D88B]/60 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Conectando ao Porto Seguro...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
