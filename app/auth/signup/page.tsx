"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Anchor, ArrowLeft, Sparkles, User, CheckCircle2, Search } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [referral, setReferral] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = value;
    if (value.length > 2) formatted = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 4) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    setBirthDate(formatted);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!email || !password) {
        setError("Preencha e-mail e senha.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
    }
    if (step === 2) {
      if (!name || !displayName || !birthDate) {
        setError("Preencha todos os campos do perfil.");
        return;
      }
    }
    setStep(step + 1);
    setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNextStep();
      return;
    }

    setLoading(true);
    setError(null);

    let finalBirthDate = birthDate;
    if (birthDate.length === 10) {
      const [d, m, y] = birthDate.split('/');
      finalBirthDate = `${y}-${m}-${d}`;
    }

    const finalDisplayName = displayName.trim() || name.split(' ')[0];

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            display_name: finalDisplayName, 
            full_name: name,
            birth_date: finalBirthDate,
            referral: referral 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: finalDisplayName,
          birth_date: finalBirthDate,
          referral: referral,
          updated_at: new Date().toISOString()
        });
      }
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <div className="flex justify-between items-center mb-6 px-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-8 h-1 rounded-full transition-all ${s <= step ? 'bg-emerald-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSignup} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Acesso Seguro</h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Passo 1: Credenciais de entrada</p>
                  </div>
                  <div className="space-y-4">
                    <div className="group relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold"
                      />
                    </div>
                    <div className="group relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold"
                      />
                    </div>
                    <div className="group relative">
                      <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="password"
                        placeholder="Confirmar Senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Sobre Você</h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Passo 2: Identidade e Perfil</p>
                  </div>
                  <div className="space-y-4">
                    <div className="group relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="Nome Completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold text-xs"
                      />
                    </div>
                    <div className="group relative">
                      <Anchor className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="Como quer ser chamado?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold text-xs"
                      />
                    </div>
                    <div className="group relative">
                      <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="Nascimento"
                        value={birthDate}
                        onChange={handleBirthDateChange}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-16 py-5 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white font-bold text-xs"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Último Passo</h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Passo 3: Como nos conheceu?</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {['Instagram', 'TikTok', 'Recomendação', 'Anúncio', 'Outros'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setReferral(opt)}
                        className={`py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-3 ${referral === opt ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                      >
                        {referral === opt && <CheckCircle2 size={16} />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-8 py-4"
                >
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-emerald-500/20">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Conta Criada!</h3>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-loose">
                      Enviamos um link de confirmação para:<br/>
                      <span className="text-emerald-400 font-black">{email}</span>
                    </p>
                    <p className="text-slate-600 text-[10px] font-bold leading-relaxed px-4">
                      Acesse o seu e-mail e clique no link para ativar seu acesso à Nórica.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            {step < 4 && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || (step === 3 && !referral)}
                className="w-full bg-emerald-500 text-slate-950 font-black py-6 rounded-full flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.25)]"
              >
                <span className="text-xs uppercase tracking-[0.3em]">
                  {loading ? 'Sincronizando...' : (step < 3 ? 'Continuar' : 'Finalizar Cadastro')}
                </span>
                {!loading && <ArrowRight size={18} />}
              </motion.button>
            )}

            {step === 4 && (
              <motion.button
                type="button"
                onClick={() => router.push('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/5 text-white border border-white/10 rounded-full py-5 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
              >
                Ir para o Login
              </motion.button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
