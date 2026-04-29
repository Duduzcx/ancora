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
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push(next);
        } else {
          router.push(`/auth?error=${encodeURIComponent(error.message)}`);
        }
      } else {
        // Se não houver código, pode ser que a sessão já tenha sido estabelecida por outro meio (ex: hash)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push(next);
        } else {
          router.push("/auth");
        }
      }
    };

    handleCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center p-6 bg-slate-900 overflow-hidden">
      <AnimatedBackground subtle />
      
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center relative">
          <div className="absolute inset-0 border-4 border-emerald-500/30 border-t-emerald-500 rounded-[2.5rem] animate-spin" />
          <Anchor size={40} className="text-emerald-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Sincronizando</h2>
          <p className="text-emerald-400/60 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Estabelecendo conexão segura...</p>
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
