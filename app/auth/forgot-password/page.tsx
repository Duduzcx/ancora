"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        setError(error.message);
      } else {
        setStep('code');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-transparent">
      <AnimatedBackground subtle />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto relative z-10"
      >
        <div className="flex justify-start mb-6 px-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para Login
          </button>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl mb-2">
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Recuperação</h1>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Protocolo de Segurança Nórica</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="group relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="email"
                        placeholder="E-mail de acesso"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-emerald-500 text-slate-950 font-black py-6 rounded-full flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.25)] disabled:opacity-50"
                  >
                    <span className="text-xs uppercase tracking-[0.3em]">
                      {isLoading ? "Validando..." : "Solicitar Link"}
                    </span>
                    {!isLoading && <Send size={18} />}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success-step"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-8 py-4"
              >
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-emerald-500/20">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Verifique seu E-mail</h3>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-loose">
                    Um protocolo foi enviado para:<br/>
                    <span className="text-emerald-400 font-black">{email}</span>
                  </p>
                  <p className="text-slate-600 text-[10px] font-bold leading-relaxed px-4">
                    Acesse o link enviado para validar sua identidade e criar sua nova credencial de acesso.
                  </p>
                </div>
                <div className="pt-4 space-y-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/')}
                    className="w-full bg-white/5 text-white border border-white/10 rounded-full py-5 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                  >
                    Voltar para Login
                  </motion.button>
                  <button 
                    onClick={() => setStep('email')}
                    className="text-emerald-500/40 font-black uppercase tracking-widest text-[9px] hover:text-emerald-400 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
