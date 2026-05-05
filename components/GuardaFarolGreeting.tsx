"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Anchor } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const greetings = [
  "O mar está calmo, {name}?",
  "Buscando abrigo no Porto hoje?",
  "Navegando por águas tranquilas ou agitadas?",
  "A bússola aponta para a paz hoje, {name}."
];

export default function GuardaFarolGreeting() {
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("Eduardo");
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile?.display_name) {
          setUserName(profile.display_name);
        } else if (session.user.user_metadata?.display_name) {
          setUserName(session.user.user_metadata.display_name);
        }
      }
    };
    fetchUser();

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(randomGreeting);
  }, [supabase]);

  const finalGreeting = greeting.replace("{name}", userName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-45 transition-transform">
        <Anchor size={120} className="text-slate-900" />
      </div>

      <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-rose-400 shadow-xl shrink-0">
        <Sparkles size={32} />
      </div>

      <div className="space-y-2 text-center md:text-left relative z-10">
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">IA Nórica</p>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
          {finalGreeting}
        </h3>
      </div>
    </motion.div>
  );
}
