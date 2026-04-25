"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, Anchor } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            data: { display_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        
        // Tenta criar o perfil mesmo se o e-mail não estiver confirmado
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({ 
            id: data.user.id, 
            display_name: name 
          });
          console.log('Profile Sync:', profileError ? 'Failed' : 'Success');
        }
        alert('Cadastro realizado! Se o e-mail de confirmação estiver ativo, verifique sua caixa de entrada. Você já pode tentar entrar.');
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
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-slate-900 text-emerald-400 rounded-3xl mb-6 shadow-xl">
            <Anchor size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            {isLogin ? 'Bem-vindo ao Porto' : 'Inicie sua Jornada'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/5 p-1 rounded-full mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-5 top-5 text-slate-400" size={18} />
              <input
                required
                type="text"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/60 border border-white/40 rounded-2xl px-12 py-5 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-800"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-5 top-5 text-slate-400" size={18} />
            <input
              required
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/60 border border-white/40 rounded-2xl px-12 py-5 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-800"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-5 text-slate-400" size={18} />
            <input
              required
              type="password"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 border border-white/40 rounded-2xl px-12 py-5 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-800"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center px-4"
            >
              {error}
            </motion.p>
          )}

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-full flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl mt-6 group"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar no Porto' : 'Ancorar Agora')}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
