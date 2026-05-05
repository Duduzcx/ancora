"use client";

import React, { useState, useEffect } from 'react';
import { Anchor, Mail, Lock, ArrowRight, Loader2, Calendar, Gem, Map, User, Wind, Cloud, Zap, LifeBuoy, MessageCircle, Sword, Lightbulb, CheckCircle2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Browser } from '@capacitor/browser';
import AnimatedBackground from '@/components/AnimatedBackground';

// Animações mais fluidas, rápidas e orgânicas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.98 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0, y: -10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, type: "spring", stiffness: 300, damping: 25 }
  }
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleSession = (session: any) => {
      if (session?.user) {
        setUser({
          ...session.user,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Navegador'
        });
      } else {
        setUser(null);
      }
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
      setIsCheckingAuth(false);
    };

    checkSession();

    // Fundamental para capturar o retorno do Google Login no Capacitor
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.zcx.ancora://login-callback',
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
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      // O onAuthStateChange vai pegar isso e mudar o estado automaticamente
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) {
        setError("E-mail ou senha inválidos.");
      } else {
        setError("Erro ao entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="h-[100dvh] w-full bg-[#080D19] flex items-center justify-center">
        <Loader2 className="text-[#00D88B] animate-spin" size={40} />
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-transparent relative transition-all overflow-x-hidden pb-32">
        <AnimatedBackground subtle={false} />
        
        {/* Top Section */}
        <div className="pt-16 pb-8 px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Protocolo de Segurança Mental
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight mt-6 whitespace-nowrap overflow-visible">
            <span className="float-slow">Sua <span className="font-brain text-6xl md:text-7xl text-pink-wave normal-case mr-2">mente</span> em </span>
            <span className="text-emerald-500 italic block text-5xl md:text-6xl">Solo firme.</span>
          </h1>
          
          <p className="text-slate-500 text-base md:text-lg max-w-sm mx-auto font-bold leading-relaxed px-4">
            A vida é um mar que não obedece a ninguém. Nórica é o seu sistema de navegação emocional.
          </p>

          <button 
            onClick={() => router.push('/porto')}
            className="mt-4 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest inline-flex items-center gap-3 shadow-xl active:scale-95 transition-transform mb-12"
          >
            Entrar no Porto
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Cais / Humor Section */}
        <div className="mx-4 md:mx-auto max-w-xl bg-white rounded-[3rem] p-6 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
              Bem-vindo ao<br/>
              cais, <span className="text-sailor">{user.display_name}</span>.
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">
              Como está a <span className="text-water text-xl">maré</span> hoje?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onClick={() => router.push('/porto?humor=calmo')} className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500"><Wind size={24} /></div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Calmo</span>
            </button>
            <button onClick={() => router.push('/porto?humor=ansioso')} className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500"><Cloud size={24} /></div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Ansioso</span>
            </button>
            <button onClick={() => router.push('/porto?humor=agitado')} className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><Zap size={24} /></div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Agitado</span>
            </button>
            <button onClick={() => router.push('/porto?humor=sos')} className="bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><LifeBuoy size={24} /></div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">S.O.S</span>
            </button>
          </div>
        </div>

        {/* Modules Explanation Section */}
        <div className="mt-20 px-6 text-center">
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-12">SISTEMA NÓRICA</h3>
          
          <div className="space-y-6 max-w-sm mx-auto pb-10">
            {/* Porto Card */}
            <div onClick={() => router.push('/porto')} className="bg-[#0b1221] rounded-[2.5rem] p-8 text-center text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="w-20 h-20 bg-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <MessageCircle size={32} className="text-white" />
              </div>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Descanso & Acolhimento</p>
              <h3 className="text-3xl font-black tracking-tight mb-4">O Porto</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                Seu cais seguro para descarregar o peso da jornada. Um espaço de escuta profunda, acolhimento e total anonimato.
              </p>
            </div>

            {/* Arena Card */}
            <div onClick={() => router.push('/arena')} className="bg-[#0b1221] rounded-[2.5rem] p-8 text-center text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/20 blur-3xl rounded-full"></div>
              <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-600/30">
                <Sword size={32} className="text-white" />
              </div>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Simulador Tático</p>
              <h3 className="text-3xl font-black tracking-tight mb-4">A Arena</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                O convés de treinamento para a vida. Pratique diálogos difíceis e prepare sua voz para enfrentar qualquer mar aberto.
              </p>
            </div>

            {/* Farol Card */}
            <div onClick={() => router.push('/farol')} className="bg-[#0b1221] rounded-[2.5rem] p-8 text-center text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <Lightbulb size={32} className="text-white" />
              </div>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Guia Proativo</p>
              <h3 className="text-3xl font-black tracking-tight mb-4">O Farol</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                A luz que corta a neblina da mente. Nossa inteligência guia seus passos de volta à segurança antes da tempestade.
              </p>
            </div>

            {/* Cofre Card */}
            <div onClick={() => router.push('/cofre')} className="bg-[#0b1221] rounded-[2.5rem] p-8 text-center text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30">
                <Lock size={32} className="text-white" />
              </div>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Privacidade Total</p>
              <h3 className="text-3xl font-black tracking-tight mb-4">O Cofre</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                Tranque seus pensamentos mais pesados. Um santuário de privacidade absoluta onde seus segredos estão a salvo.
              </p>
            </div>

            {/* Logs de Sobrevivência Card */}
            <div onClick={() => router.push('/log')} className="bg-[#0b1221] rounded-[2.5rem] p-8 text-center text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full"></div>
              <div className="w-20 h-20 bg-[#00A3A3] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-600/30">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase italic">Logs de Sobrevivência</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-tighter">
                O registro diário de sua jornada. Revise seus marcos e mantenha o rumo em águas seguras.
              </p>
            </div>

            <div className="pt-12 pb-10 text-center space-y-2 relative z-10">
              <h3 className="text-5xl font-black italic tracking-tighter text-breath">Respiração.</h3>
              <p className="text-sm font-bold text-slate-500 tracking-tight">Sincronize-se com o ritmo da Nórica.</p>
              
              <div className="flex flex-col items-center pt-20">
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      "0 0 20px rgba(16, 185, 129, 0.1)",
                      "0 0 80px rgba(16, 185, 129, 0.5)",
                      "0 0 20px rgba(16, 185, 129, 0.1)"
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-full bg-white border-2 border-emerald-500/30 flex items-center justify-center relative overflow-hidden shadow-inner"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                  <Anchor className="text-emerald-500/40 relative z-10" size={48} strokeWidth={3} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Tela de Login com 100% height, sem arrastar (overflow-hidden) e justificada ao centro
  return (
    <main className="h-[100dvh] w-full bg-[#080D19] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#00D88B]/30">
      
      {/* Background com Âncoras visíveis e fluidas */}
      <AnimatedBackground subtle={false} />

      {/* Background Glows leves para não travar a GPU */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00D88B]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] flex flex-col items-center z-10"
      >
        
        {/* Logo */}
        <motion.div 
          variants={logoVariants}
          className="relative mb-6"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#00D88B] blur-[20px] rounded-full"
          />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#00D88B] rounded-full flex items-center justify-center shadow-lg">
            <Anchor size={32} className="text-black" />
          </div>
        </motion.div>

        {/* Textos da Marca */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic tracking-tight mb-1 uppercase drop-shadow-md">
            PORTO SEGURO
          </h1>
          <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-[#00D88B] tracking-[0.3em] uppercase opacity-90">
            Nórica • Navegação Mental
          </p>
        </motion.div>

        {/* Card Principal */}
        <motion.div 
          variants={itemVariants}
          className="w-full bg-[#101726]/90 backdrop-blur-md rounded-[36px] p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
        >
          <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#00D88B]/40 to-transparent"></div>
          <div className="absolute top-0 inset-x-20 h-[15px] bg-[#00D88B]/10 blur-[10px] rounded-full pointer-events-none"></div>

          {/* Botão Google */}
          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-[56px] sm:h-[60px] bg-white rounded-full flex items-center justify-center gap-3 font-black text-xs text-black hover:bg-gray-100 transition-colors mb-5 disabled:opacity-60 shadow-md active:scale-[0.98]"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin text-black" size={20} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'CARREGANDO...' : 'ENTRAR COM GOOGLE'}
          </button>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">Ou e-mail</span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 mb-3">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00D88B] transition-colors">
                <Mail size={18} />
              </div>
              <input 
                required
                type="email" 
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[56px] sm:h-[60px] bg-[#182133] rounded-[24px] pl-14 pr-6 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#00D88B]/50 transition-all font-medium border border-transparent focus:border-[#00D88B]/20"
              />
            </div>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00D88B] transition-colors">
                <Lock size={18} />
              </div>
              <input 
                required
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[56px] sm:h-[60px] bg-[#182133] rounded-[24px] pl-14 pr-6 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#00D88B]/50 transition-all font-medium border border-transparent focus:border-[#00D88B]/20"
              />
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 text-center uppercase tracking-wider">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end mb-5">
            <button 
              type="button"
              onClick={() => router.push('/auth/forgot-password')}
              className="text-[10px] font-bold text-[#00D88B] tracking-wider uppercase hover:text-[#00D88B]/80 transition-colors"
            >
              Esqueci a senha
            </button>
          </div>

          <button 
            type="button"
            onClick={() => handleLogin()}
            disabled={loading || googleLoading}
            className="w-full h-[56px] sm:h-[60px] bg-[#00D88B] rounded-[24px] flex items-center justify-center gap-2 font-black text-xs text-black uppercase tracking-widest hover:bg-[#00D88B]/90 transition-all shadow-[0_10px_25px_rgba(0,216,139,0.2)] mb-5 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'ENTRAR NA NÓRICA'}
            {!loading && <ArrowRight size={16} className="ml-1" />}
          </button>

          <div className="text-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-white/40 tracking-wider uppercase">
              Novo por aqui?{' '}
            </span>
            <button 
              type="button"
              onClick={() => router.push('/auth/signup')}
              className="text-[10px] sm:text-[11px] font-bold text-[#00D88B] tracking-wider uppercase hover:text-[#00D88B]/80 transition-colors"
            >
              Criar Conta
            </button>
          </div>

        </motion.div>
      </motion.div>
    </main>
  );
}
