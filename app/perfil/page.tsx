"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import { 
  User, Save, CheckCircle2, ArrowLeft, ShieldCheck, 
  Anchor, LifeBuoy, Mail, Calendar, 
  LogOut, Settings, Fingerprint, AlertCircle, Loader2,
  ChevronRight, BadgeCheck, Shield, Key, Sparkles,
  ShipWheel, Compass, Waves
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// Componente para efeito de digitação lenta
const TypingName = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 200); // Digitação bem lenta conforme pedido
    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.span 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="inline-block"
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block ml-1 w-1 h-8 bg-emerald-500"
      />
    </motion.span>
  );
};

export default function PerfilPage() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [isExiting, setIsExiting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const calculateAge = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 10) return;
    const [d, m, y] = dateStr.split('/').map(Number);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return;
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let ageVal = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      ageVal--;
    }
    setAge(ageVal >= 0 ? ageVal : 0);
  };

  useEffect(() => {
    setIsMounted(true);
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const sessionUser = session.user;
      setUser(sessionUser);
      
      const metaName = sessionUser.user_metadata?.display_name;
      const metaBirth = sessionUser.user_metadata?.birth_date;
      
      if (metaName) setName(metaName);
      if (metaBirth) {
        const [y, m, d] = metaBirth.split('-');
        const formatted = `${d}/${m}/${y}`;
        setBirthDate(formatted);
        calculateAge(formatted);
        setIsLocked(true);
      }

      const { data: profile } = await supabase.from('profiles')
        .select('display_name, birth_date')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (profile) {
        if (profile.display_name) setName(profile.display_name);
        if (profile.birth_date) {
          const [y, m, d] = profile.birth_date.split('-');
          const formatted = `${d}/${m}/${y}`;
          setBirthDate(formatted);
          calculateAge(formatted);
          setIsLocked(true);
        }
      }
      setIsDataLoaded(true);
    };
    loadProfile();
  }, [supabase]);

  const handleBirthDateChange = (val: string) => {
    if (isLocked) return;
    const cleaned = val.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    setBirthDate(formatted);
    if (formatted.length === 10) calculateAge(formatted);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading || isLocked) return;

    setError(null);
    if (!name.trim()) { setError("Digite seu nome."); return; }
    if (birthDate.length !== 10) { setError("Data de nascimento incompleta."); return; }

    setLoading(true);
    try {
      const [d, m, y] = birthDate.split('/');
      const isoDate = `${y}-${m}-${d}`;
      
      const { error: authError } = await supabase.auth.updateUser({ 
        data: { display_name: name.trim(), birth_date: isoDate } 
      });
      if (authError) throw authError;

      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name.trim(),
        birth_date: isoDate,
        updated_at: new Date().toISOString(),
        name_changed: true
      });

      setSaved(true);
      setIsLocked(true);
      await supabase.auth.refreshSession();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError("Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsExiting(true);
    // Aguarda animação de "afundar" antes de deslogar
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.replace('/');
    }, 1500);
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen relative transition-all overflow-x-hidden pb-40 selection:bg-emerald-500/10 bg-slate-50">
      <AnimatedBackground subtle />
      
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-blue-600 flex items-center justify-center overflow-hidden"
          >
            {/* Efeito de Bolhas / Água */}
            <motion.div 
              animate={{ y: [-1000, 1000] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle, white 10%, transparent 10%)', backgroundSize: '100px 100px' }}
            />
            <div className="relative z-10 text-center space-y-4">
              <motion.div
                animate={{ y: [0, 20], rotate: [0, 15] }}
                transition={{ duration: 1.5, ease: "easeIn" }}
              >
                <Anchor size={80} className="text-white/80 mx-auto" />
              </motion.div>
              <p className="text-white font-black uppercase tracking-[0.5em] animate-pulse">Saindo do Porto...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 inset-x-0 h-20 bg-white/40 backdrop-blur-3xl border-b border-emerald-100/30 z-50 flex items-center justify-center px-6 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em] italic">Comando Central</h2>
      </header>

      <motion.div
        animate={isExiting ? { scale: 0.8, opacity: 0, y: 100 } : { scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="max-w-md mx-auto px-6 pt-32 relative z-10 space-y-8"
      >
        
        {/* Avatar Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
          style={{ willChange: 'transform, opacity' }}
          className="bg-white/80 backdrop-blur-2xl border border-white rounded-[4rem] p-10 shadow-2xl shadow-emerald-500/10 text-center space-y-6 relative overflow-hidden cursor-default"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-bl-full -mr-8 -mt-8" />
          
          <div className="relative inline-block">
            {/* Timão Oscilante */}
            <motion.div 
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3.2rem] flex items-center justify-center border-[6px] border-white shadow-2xl relative z-10"
            >
              <ShipWheel size={56} className="text-white" />
            </motion.div>
            
            {/* Âncora Flutuante */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-2 bg-white text-emerald-500 p-2.5 rounded-2xl shadow-lg z-20 border-2 border-emerald-50"
            >
               <Anchor size={20} />
            </motion.div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic min-h-[44px] flex items-center justify-center">
              {isDataLoaded ? <TypingName text={name || "Marujo"} /> : "..."}
            </h1>
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.4em]">Navegador Ativo</p>
          </div>
        </motion.div>

        {/* Data Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ willChange: 'transform, opacity' }}
          className="bg-white border border-slate-100 rounded-[3.5rem] p-8 shadow-xl space-y-8 relative overflow-hidden"
        >
           <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
              {error && (
                <div className="p-4 bg-rose-50 text-rose-500 text-xs font-bold rounded-2xl border border-rose-100 flex items-center gap-3">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Identidade de Bordo</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:text-emerald-500 transition-colors">
                    <Fingerprint size={20} />
                  </div>
                  <input
                    disabled={isLocked || !isDataLoaded}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-16 py-5 outline-none focus:border-emerald-500 transition-all text-base font-bold text-slate-800 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Data de nascimento</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:text-emerald-500 transition-colors">
                    <Calendar size={20} />
                  </div>
                  <input
                    disabled={isLocked || !isDataLoaded}
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-16 py-5 outline-none focus:border-emerald-500 transition-all text-base font-bold text-slate-800 disabled:opacity-60"
                  />
                </div>
                
                {/* CARD DE IDADE BONITO */}
                <AnimatePresence>
                  {age !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative mt-4 p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-2xl shadow-emerald-500/20 overflow-hidden border-2 border-white/20"
                    >
                      <div className="absolute -right-4 -top-4 text-white/10 rotate-12">
                         <ShipWheel size={120} />
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Idade no Mar</p>
                          <h3 className="text-4xl font-black italic tracking-tighter leading-none">{age} <span className="text-xl">Anos</span></h3>
                        </div>
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                           <Waves size={28} className="text-white/80" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                            className="h-full bg-white/60"
                           />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Jornada em Curso</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isLocked ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={loading || !isDataLoaded}
                  type="submit"
                  className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-600"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Registrar Identidade"}
                </motion.button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Identidade Ancorada</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 leading-none">Registro seguro no porto.</p>
                  </div>
                </motion.div>
              )}
           </form>
        </motion.div>

        {/* Logout */}
        <motion.button 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileTap={{ scale: 0.96 }}
          style={{ willChange: 'transform, opacity' }}
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-7 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:bg-rose-50 transition-all group"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:rotate-12 transition-transform">
                <LogOut size={24} />
             </div>
             <div className="text-left">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Sair</h3>
                <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest leading-none mt-1">Encerrar Sessão</p>
             </div>
          </div>
          <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic pt-10">
          Nórica • Sistema de Navegação Mental
        </p>
      </motion.div>
    </main>
  );
}
