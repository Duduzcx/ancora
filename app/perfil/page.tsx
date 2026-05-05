"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import { 
  User, Save, CheckCircle2, ArrowLeft, ShieldCheck, 
  Anchor, Trash2, LifeBuoy, Mail, Calendar, 
  MapPin, LogOut, Settings, Bell, Fingerprint, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function PerfilPage() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasChangedName, setHasChangedName] = useState(false);
  const [hasChangedBirthDate, setHasChangedBirthDate] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      
      if (sessionUser) {
        setUser(sessionUser);
        
        const { data: profile } = await supabase.from('profiles')
          .select('display_name, name_changed, birth_date')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (profile) {
          setName(profile.display_name || sessionUser.user_metadata?.display_name || '');
          setHasChangedName(profile.name_changed === true);
          if (profile.birth_date) {
            setHasChangedBirthDate(true);
            const [y, m, d] = profile.birth_date.split('-');
            setBirthDate(`${d}/${m}/${y}`);
            calculateAge(`${d}/${m}/${y}`);
          }
        } else {
          setName(sessionUser.user_metadata?.display_name || '');
        }
        setIsDataLoaded(true);
      }
    };
    getProfile();
  }, [supabase]);

  const calculateAge = (dateStr: string) => {
    if (dateStr.length !== 10) return;
    const [d, m, y] = dateStr.split('/').map(Number);
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let ageVal = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      ageVal--;
    }
    setAge(ageVal > 0 ? ageVal : 0);
  };

  const handleBirthDateChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    setBirthDate(formatted);
    if (formatted.length === 10) calculateAge(formatted);
  };

  const toggleDock = (show: boolean) => {
    window.dispatchEvent(new CustomEvent('toggleDock', { detail: show }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    
    setError(null);

    if (!name.trim()) {
      setError("O nome de exibição é obrigatório.");
      return;
    }
    if (birthDate.length !== 10) {
      setError("A data de nascimento completa é obrigatória.");
      return;
    }

    setLoading(true);

    try {
      let finalBirthDate = '';
      const [d, m, y] = birthDate.split('/');
      finalBirthDate = `${y}-${m}-${d}`;

      const updates: any = {
        id: user.id,
        birth_date: finalBirthDate,
        updated_at: new Date().toISOString(),
      };

      if (!hasChangedName) {
        updates.display_name = name.trim();
        updates.name_changed = true;
      }

      const { error: dbError } = await supabase.from('profiles').upsert(updates);
      if (dbError) throw dbError;

      const authUpdates: any = { birth_date: finalBirthDate };
      if (!hasChangedName) authUpdates.display_name = name.trim();
      
      await supabase.auth.updateUser({ data: authUpdates });

      setSaved(true);
      if (updates.name_changed) setHasChangedName(true);
      setHasChangedBirthDate(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error.message);
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (!isMounted) return null;

  const isFullyConfigured = hasChangedName && hasChangedBirthDate;

  return (
    <>
      <div className="fixed inset-0 bg-slate-50 -z-50" />
      <main className="min-h-[100dvh] bg-slate-50 relative overflow-x-hidden pb-12">
        <AnimatedBackground subtle />
      
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 relative z-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-10 space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10">
              <User size={40} className="text-emerald-500" />
            </div>
            <div className="absolute -inset-2 bg-emerald-500/20 rounded-[3rem] blur-xl opacity-50" />
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-slate-50 rounded-full flex items-center justify-center shadow-lg z-20"
            >
              <ShieldCheck size={14} className="text-white" />
            </motion.div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex justify-center flex-wrap min-h-[40px]">
              {isDataLoaded ? (
                (name || "Navegador").split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))
              ) : (
                <div className="w-32 h-8 bg-slate-200 animate-pulse rounded-lg" />
              )}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Membro Nórica Premium</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {/* Section: Identidade */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6">
            <div className="flex items-center gap-3 mb-2 px-2">
              <Fingerprint size={18} className="text-emerald-500" />
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Identidade</h2>
            </div>

            {isDataLoaded && (!hasChangedName || !hasChangedBirthDate) && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                  Importante: Você só pode definir seu nome e data uma única vez para garantir a integridade do seu log.
                </p>
              </div>
            )}
            
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nome de Exibição</label>
                    {hasChangedName && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Definido</span>}
                  </div>
                  <div className="relative">
                    <User className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${hasChangedName ? 'text-emerald-500/40' : 'text-slate-300'}`} size={16} />
                    <input
                      disabled={hasChangedName || loading || !isDataLoaded}
                      type="text"
                      value={name}
                      onFocus={() => toggleDock(false)}
                      onBlur={() => toggleDock(true)}
                      onChange={(e) => setName(e.target.value)}
                      className={`
                        w-full rounded-2xl px-12 py-4 outline-none transition-all text-xs font-black
                        ${hasChangedName 
                          ? 'bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed shadow-inner' 
                          : 'bg-slate-50 border border-slate-100 text-slate-800 focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5'}
                        ${!isDataLoaded ? 'animate-pulse' : ''}
                      `}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Data de Nascimento {age !== null && <span className="text-emerald-500 ml-2">({age} anos)</span>}
                    </label>
                    {hasChangedBirthDate && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Definida</span>}
                  </div>
                  <div className="relative">
                    <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${hasChangedBirthDate ? 'text-emerald-500/40' : 'text-slate-300'}`} size={16} />
                    <input
                      disabled={hasChangedBirthDate || loading || !isDataLoaded}
                      type="text"
                      inputMode="numeric"
                      value={birthDate}
                      placeholder="DD/MM/AAAA"
                      onFocus={() => toggleDock(false)}
                      onBlur={() => toggleDock(true)}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className={`
                        w-full rounded-2xl px-12 py-4 outline-none transition-all text-xs font-black
                        ${hasChangedBirthDate 
                          ? 'bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed shadow-inner' 
                          : 'bg-slate-50 border border-slate-100 text-slate-800 focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5'}
                        ${!isDataLoaded ? 'animate-pulse' : ''}
                      `}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600"
                  >
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                disabled={loading || isFullyConfigured || !isDataLoaded}
                whileHover={!loading && !isFullyConfigured && isDataLoaded ? { scale: 1.02 } : {}}
                whileTap={!loading && !isFullyConfigured && isDataLoaded ? { scale: 0.98 } : {}}
                className={`
                  w-full font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg
                  ${isFullyConfigured 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed' 
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'}
                  ${loading || !isDataLoaded ? 'opacity-70' : ''}
                `}
              >
                <span className="text-[10px] uppercase tracking-widest">
                  {!isDataLoaded ? "Carregando..." : loading ? "Sincronizando..." : saved ? "Perfil Atualizado!" : isFullyConfigured ? "Perfil Já Configurado" : "Salvar Alterações"}
                </span>
                {isDataLoaded && !loading && (saved ? <CheckCircle2 size={16} /> : <Save size={16} />)}
                {!isDataLoaded && <Loader2 size={16} className="animate-spin" />}
              </motion.button>
            </form>
          </div>

          {/* Section: Conta & Segurança */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-5">
            <div className="flex items-center gap-3 mb-2 px-2">
              <ShieldCheck size={18} className="text-blue-500" />
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Conta & Segurança</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">E-mail Vinculado</p>
                    <p className="text-[9px] font-black text-slate-500 break-all">{user?.email}</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[7px] font-black uppercase rounded-full border border-emerald-500/20 shrink-0">
                  Ativo
                </div>
              </div>

              <button 
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Settings size={16} className="text-slate-400" />
                  </div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Redefinir Senha</p>
                </div>
                <ArrowLeft size={16} className="text-slate-300 rotate-180 group-hover:text-emerald-500 transition-all" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 px-2 space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
            >
              <LogOut size={16} />
              Encerrar Sessão
            </motion.button>

            <button 
              onClick={() => router.push('/excluir-conta')}
              className="w-full py-2 text-[9px] font-black text-slate-300 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              Excluir minha conta permanentemente
            </button>
          </div>

        </div>
      </div>
      </main>
    </>
  );
}
