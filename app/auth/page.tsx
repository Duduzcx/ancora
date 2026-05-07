"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ArrowLeft, User } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import { Browser } from '@capacitor/browser';
import AnimatedBackground from '@/components/AnimatedBackground';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace('/');
    };
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.zcx.norica://login-callback',
          queryParams: { prompt: 'select_account' },
          skipBrowserRedirect: true
        },
      });
      if (error) throw error;
      if (data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.push('/');
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) {
        setError("E-mail ou senha inválidos.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Confirme seu e-mail para entrar.");
      } else if (msg.includes("Rate limit exceeded")) {
        setError("Muitas tentativas. Tente mais tarde.");
      } else {
        setError("Erro ao entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-[#0a0f1d] selection:bg-emerald-500/30">
      <AnimatedBackground subtle />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto relative z-10"
      >
        <div className="text-center mb-10 relative">
          {/* Brilho de fundo (Efeito Farol) */}
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full -z-10"
          />

          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              y: [0, -10, 0] 
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 260, damping: 20 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="inline-flex p-6 bg-emerald-500 text-slate-950 rounded-[2rem] mb-6 shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
          >
            <AppLogo size={48} />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
            Porto Seguro
          </h1>
          <p className="text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em] mt-3">Nórica • Navegação Mental</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-slate-950 py-4 rounded-full flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50"
            >
              <GoogleIcon />
              Entrar com Google
            </motion.button>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">ou e-mail</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-3">
                <div className="group relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={16} />
                  <input
                    required
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-14 py-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold text-sm"
                  />
                </div>
                <div className="group relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={16} />
                  <input
                    required
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-14 py-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold text-sm"
                  />
                </div>
                <div className="flex justify-end px-4">
                  <button 
                    type="button" 
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-[9px] font-black uppercase tracking-widest text-emerald-500/40 hover:text-emerald-400 transition-colors"
                  >
                    Esqueci a senha
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[9px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-emerald-500 text-slate-950 font-black py-5 rounded-full flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.3)]"
              >
                <span className="text-[10px] uppercase tracking-[0.3em]">
                  {loading ? 'Acessando...' : 'Entrar na Nórica'}
                </span>
                {!loading && <ArrowRight size={16} />}
              </motion.button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/auth/signup')}
                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Novo por aqui? <span className="text-emerald-500/60 font-black">Criar conta</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
