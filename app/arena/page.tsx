"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Briefcase, Heart, ArrowLeft, Send, User, X, Loader2, Sparkles, ArrowRight, Mic, MicOff, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const scenarios = [
  { id: 1, title: "Reunião de Feedback", desc: "Pratique como lidar com críticas construtivas e pedir aumento.", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 2, title: "Conflito Familiar", desc: "Resolva desentendimentos com comunicação não-violenta.", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  { id: 3, title: "Primeiro Encontro", desc: "Quebre o gelo e mantenha a autenticidade sob pressão.", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
];

const ARENA_PROMPT = `Você é o Simulador Tático da Arena Nórica. 
Sua missão é atuar como o personagem desafiador no cenário escolhido pelo usuário.
Regras:
1. Seja realista e um pouco difícil, para que o usuário realmente treine.
2. Responda sempre de forma concisa (máximo 2 parágrafos).
3. Após cada fala do usuário, responda como o personagem e mantenha o diálogo vivo.
4. Use emojis que combinem com a emoção do personagem.`;

export default function ArenaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = async (e, customInput) => {
    if (e) e.preventDefault();
    const content = customInput || input;
    if (!content.trim() || isLoading) return;

    if (!customInput) {
      const userMessage = { id: Date.now().toString(), role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = '44px';
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: ARENA_PROMPT + `\nCENÁRIO ATUAL: ${selected?.title}` },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content }
          ],
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Estou pronto para o desafio. Comece você.";
      
      setIsLoading(false);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: botText }]);
    } catch (err) {
      console.error("ERRO_ARENA_DIRETO:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selected && messages.length === 0) {
      handleSendMessage(null, `SISTEMA: Iniciar Simulação Arena - ${selected.title}. Comece o diálogo como o personagem desafiador.`);
    }
  }, [selected]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isRecording, isTranscribing]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 44 ? `${scrollHeight}px` : '44px';
    }
  }, [input]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
        .find(type => MediaRecorder.isTypeSupported(type)) || '';
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current?.mimeType || 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'pt');
      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}` },
        body: formData,
      });
      const data = await response.json();
      if (data.text) setInput(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  if (!isMounted) return null;

  const visibleMessages = messages.filter(m => !m.content.startsWith('SISTEMA:'));

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-[#FDFCF7] z-10">
      <AnimatedBackground subtle />
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto w-full p-6 pt-12 custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex items-center justify-between">
                <button onClick={() => router.push('/')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-900 shadow-sm active:scale-95">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
                  <Sparkles size={14} className="text-rose-500" />
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Premium Arena</span>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">A Arena <span className="text-rose-600 italic">Social.</span></h2>
                <p className="text-slate-500 font-bold max-w-xl mx-auto text-sm">Simule conversas difíceis em um ambiente de treinamento seguro e receba feedback em tempo real.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="group bg-white border border-slate-200 p-8 rounded-[3rem] text-left hover:border-rose-500/30 transition-all shadow-xl hover:shadow-2xl active:scale-95 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-full" />
                    <div className={`mb-6 p-5 rounded-2xl ${s.bg} ${s.color} w-fit shadow-inner group-hover:scale-110 transition-transform`}>
                      <s.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{s.title}</h3>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed opacity-80">{s.desc}</p>
                    <div className="mt-8 flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                      Iniciar Treino <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <header className="flex-none p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl z-30 pt-[calc(env(safe-area-inset-top)+1rem)]">
              <button onClick={() => { setSelected(null); setMessages([]); }} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 active:scale-95 shadow-sm">
                <X size={20} />
              </button>
              <div className="text-right">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">{selected.title}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Sessão de Treinamento Ativa</p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-50/50 custom-scrollbar overscroll-contain">
              <div className="max-w-3xl mx-auto space-y-8 py-8">
                {visibleMessages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-rose-600 border border-slate-100'}`}>
                        {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>
                      <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl border ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <b className="font-black text-rose-600" {...props} />,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <Bot size={20} className="text-rose-500" />
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center justify-center min-w-[80px]">
                      <div className="flex gap-1.5">
                        <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                        <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                        <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {isRecording && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="flex justify-end gap-3">
                      <div className="bg-slate-900 p-5 rounded-[2rem] rounded-tr-none shadow-xl flex items-center justify-center min-w-[80px] border border-slate-800">
                        <div className="flex gap-1.5">
                          <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                          <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                          <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-rose-400 flex items-center justify-center shadow-lg border border-slate-800 animate-pulse">
                        <User size={20} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-none p-4 md:p-6 bg-transparent z-40 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
              <form 
                onSubmit={handleSendMessage} 
                className="max-w-3xl mx-auto flex items-center gap-2 bg-white border border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem] p-1.5 focus-within:ring-4 ring-rose-500/20 transition-all min-h-[52px]"
              >
                <textarea 
                  ref={textareaRef}
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isRecording ? "Ouvindo você..." : isTranscribing ? "Processando voz..." : "Sua resposta tática..."} 
                  className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 text-sm font-semibold placeholder-slate-400/80 resize-none max-h-40 min-h-[44px] custom-scrollbar leading-relaxed overflow-y-auto" 
                  rows={1}
                />
                
                <div className="flex items-center justify-center pr-1.5 h-full">
                  <AnimatePresence mode="wait">
                    {!input.trim() && !isTranscribing ? (
                      <motion.button
                        key="mic"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-rose-500'}`}
                      >
                        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                      </motion.button>
                    ) : (
                      <motion.button 
                        key="send"
                        initial={{ opacity: 0, scale: 0.8, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                        whileTap={{ scale: 0.90 }}
                        type="submit" 
                        disabled={isLoading || isTranscribing} 
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
      `}</style>
    </main>
  );
}
