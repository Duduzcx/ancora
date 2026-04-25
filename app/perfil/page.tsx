"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { User, Save, CheckCircle2, ArrowLeft, ShieldCheck, Anchor, Trash2, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

interface AnchorPoint {
  id: number;
  x: number;
  y: number;
  size: number;
}

export default function PerfilPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasChangedName, setHasChangedName] = useState(false);
  const [anchors, setAnchors] = useState<AnchorPoint[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const getProfile = async () => {
      // Check inicial ultrarrápido via sessão
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      
      if (sessionUser) {
        setUser(sessionUser);
        setName(sessionUser.user_metadata?.display_name || '');

        // Perfil em segundo plano
        supabase.from('profiles')
          .select('display_name, name_changed')
          .eq('id', sessionUser.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              setName(profile.display_name || sessionUser.user_metadata?.display_name || '');
              setHasChangedName(profile.name_changed === true);
            }
          });
      }
    };
    getProfile();
  }, [supabase]);

  if (!isMounted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Anchor size={48} className="text-slate-900 animate-spin-slow" />
    </div>
  );

  const dropAnchor = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newAnchor: AnchorPoint = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      size: Math.random() * 10 + 20,
    };
    setAnchors(prev => [...prev.slice(-15), newAnchor]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || hasChangedName || !name.trim()) return;
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({ 
        data: { display_name: name } 
      });
      if (authError) throw authError;

      const { error: dbError } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name,
        name_changed: true,
        updated_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;

      setSaved(true);
      setHasChangedName(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-6 overflow-hidden bg-slate-50">
      <AnimatedBackground />
      
      <motion.div 
        layout
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[4rem] p-6 md:p-10 shadow-2xl relative z-10"
      >
        <div className="lg:col-span-5 space-y-8 border-r border-slate-200/50 pr-0 lg:pr-8">
          <Link href="/">
            <motion.button 
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-slate-400 font-black text-[10px] mb-8 hover:text-slate-900 transition-colors uppercase tracking-[0.3em]"
            >
              <ArrowLeft size={14} />
              Retornar ao Porto
            </motion.button>
          </Link>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Minha Base</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sua Identidade Digital</p>
          </div>

          <div className="space-y-6 pt-6">
            <div className="p-6 bg-slate-900/5 rounded-3xl border border-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identidade Confirmada</span>
                <ShieldCheck size={14} className="text-emerald-500" />
              </div>
              <p className="text-slate-900 font-black text-sm truncate">{user?.email}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="relative">
                <User className="absolute left-5 top-5 text-slate-400" size={18} />
                <input
                  disabled={hasChangedName || loading}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome no Âncora"
                  className={`w-full bg-white/80 border border-white/60 rounded-2xl px-12 py-5 outline-none transition-all text-slate-800 font-black ${hasChangedName ? 'opacity-50 grayscale cursor-not-allowed' : 'focus:ring-4 focus:ring-emerald-500/10'}`}
                />
              </div>
              {!hasChangedName && (
                  <motion.button
                    disabled={loading || !name.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-full flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30"
                  >
                    Salvar Alteração
                    <Save size={18} />
                  </motion.button>
              )}
              {hasChangedName && (
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest px-4">
                  Sua identidade já foi fixada e não pode mais ser alterada.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-6 h-[400px] lg:h-auto">
          <div 
            className="flex-1 relative bg-slate-950 rounded-[3.5rem] overflow-hidden cursor-crosshair group active:scale-[0.99] transition-transform shadow-inner"
            onClick={dropAnchor}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {anchors.map((anchor, i) => (
                anchors.slice(i + 1).map((nextAnchor, j) => {
                  const dist = Math.hypot(anchor.x - nextAnchor.x, anchor.y - nextAnchor.y);
                  if (dist < 200) {
                    return (
                      <motion.line
                        key={`${anchor.id}-${nextAnchor.id}`}
                        x1={anchor.x} y1={anchor.y}
                        x2={nextAnchor.x} y2={nextAnchor.y}
                        stroke="rgba(16,185,129,0.15)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                      />
                    );
                  }
                  return null;
                })
              ))}
            </svg>

            <AnimatePresence>
              {anchors.map((anchor) => (
                <motion.div
                  key={anchor.id}
                  initial={{ y: -50, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ left: anchor.x - (anchor.size/2), top: anchor.y - (anchor.size/2) }}
                >
                  <Anchor size={anchor.size} />
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none space-y-4">
              <LifeBuoy size={48} className="text-emerald-500/10 animate-spin-slow" />
              <p className="text-white/20 font-black text-[9px] uppercase tracking-[0.6em] text-center max-w-xs leading-relaxed">
                Clique para lançar âncoras <br/> e criar sua rede de segurança
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3 text-slate-500">
              <Anchor size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">{anchors.length}/15 Pontos de Firmeza</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, color: '#ef4444' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnchors([])}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors"
            >
              <Trash2 size={14} />
              Limpar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ArrowLeft({ size, className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}
