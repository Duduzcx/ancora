"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Anchor, ArrowLeft, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Detecta se a sessão foi estabelecida (ex: pelo LayoutWrapper) e redireciona
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
      } else {
        setLoading(false); // Libera o botão se voltar e não tiver sessão
      }
    };
    
    checkSession();
    window.addEventListener('focus', checkSession);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        router.replace('/');
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', checkSession);
    };
  }, [router]);

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = value;
    if (value.length > 2) {
      formatted = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }

    setBirthDate(formatted);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.zcx.ancora://login-callback',
          queryParams: { prompt: 'select_account' }
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalBirthDate = birthDate;
    if (birthDate.length === 10) {
      const [d, m, y] = birthDate.split('/');
      finalBirthDate = `${y}-${m}-${d}`;
    }

    // Pega apenas o primeiro nome para exibição inicial amigável
    const rawName = name.trim() || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
    const displayName = rawName.split(' ')[0];

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              display_name: displayName, 
              birth_date: finalBirthDate,
              full_name: rawName
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            display_name: displayName,
            birth_date: finalBirthDate,
            updated_at: new Date().toISOString()
          });
        }

        if (!data.session) {
          alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        }
      }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-[#0f172a]">
      {/* Background sutil */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <AnimatedBackground subtle />
      </div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex p-6 bg-emerald-500 text-slate-950 rounded-[2.5rem] mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
          >
            <Anchor size={40} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            {isLogin ? 'Entrar no Porto' : 'Ancorar Conta'}
          </h1>
          <p className="text-slate-400 font-bold text-sm">Sua mente em solo firme.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl">
          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-slate-900 py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50"
            >
              <GoogleIcon />
              Entrar com Google
            </motion.button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">ou e-mail</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <div className="group relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold shadow-inner"
                  />
                </div>
                <div className="group relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold shadow-inner"
                  />
                </div>
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 pt-2"
                    >
                      <div className="group relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                        <input
                          required={!isLogin}
                          type="text"
                          placeholder="Nome Completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold shadow-inner"
                        />
                      </div>
                      <div className="group relative">
                        <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                        <input
                          required={!isLogin}
                          type="text"
                          placeholder="Data de Nascimento (DD/MM/AAAA)"
                          value={birthDate}
                          onChange={handleBirthDateChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white text-sm font-bold shadow-inner"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={loading}
                className="w-full bg-emerald-500 text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(16,185,129,0.2)] mt-4"
              >
                <span className="text-xs uppercase tracking-[0.2em]">
                  {loading ? 'Processando...' : (isLogin ? 'Entrar no Porto' : 'Ancorar Agora')}
                </span>
                {!loading && <ArrowRight size={18} />}
              </motion.button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {isLogin ? 'Não tem conta? Crie uma agora' : 'Já possui conta? Faça o login'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
