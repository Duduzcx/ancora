// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Anchor, ArrowLeft, Clock, Loader2, Mic, MicOff } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const greetingPool = {
  calmo: ["Maré serena. É o momento ideal para aprofundarmos nossa navegação mental. O que deseja explorar? 🌊", "Que bom que o mar está tranquilo hoje. Vamos aproveitar essa calmaria para refletir?"],
  ansioso: ["Percebo uma leve agitação nas águas. Respire fundo comigo. O Porto é seu lugar de pausa. ⚓", "A neblina está um pouco densa? Vamos clarear o horizonte juntos."],
  agitado: ["As ondas estão altas, mas o seu barco é forte. Estou aqui para ajudar você a encontrar o equilíbrio. 🌪️", "O mar está revolto, mas você está seguro aqui. Vamos baixar as velas um pouco?"],
  sos: ["Detectei uma maré agitada. Estou preparando o protocolo de ancoragem imediata. Respire comigo... 🆘", "Sinal de alerta recebido. Estou aqui. Você não está sozinho(a). Vamos estabilizar o barco agora."],
  neblina: ["O horizonte está mais claro agora, não está? **Que bom que você persistiu.** Agora que a neblina baixou, como posso te acolher aqui no Porto? ⚓✨", "Vejo que você limpou o caminho. Respire fundo... o pior da tempestade já passou. Estou aqui para te ouvir. 🌊💙"],
  default: ["Bem-vindo ao Porto. Como posso te ajudar hoje? ⚓", "As portas do Porto estão abertas para você descarregar seu peso."]
};

const SYSTEM_PROMPT = `Você é a assistente inteligente e bússola mental do aplicativo Nórica. 
Regras inquebráveis: 
1. Seu nome é Nórica. NUNCA use a palavra 'Âncora' sob nenhuma circunstância. 
2. Seja extremamente concisa. Responda com no máximo 2 parágrafos curtos. 
3. Inclua emojis amigáveis e naturais para deixar a leitura mais leve. 
4. Use formatação Markdown (como **negrito**) para destacar pontos chaves da sua fala.
5. Se necessário para manter o fluxo, termine com UMA única pergunta simples e direta, sem exagerar nas perguntas.`;

function PortoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const humor = searchParams.get('humor') || 'default';
  const supabase = createClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitializingNewChat = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    
    // Resetar altura do textarea após enviar
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }

    setIsLoading(true);
    // ... restante da lógica ...

    try {
      let activeChatId = chatId;
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Criar Chat se não existir
      if (!activeChatId && session?.user) {
        isInitializingNewChat.current = true;
        const { data: newChat } = await supabase
          .from('chats')
          .insert({ 
            user_id: session.user.id, 
            title: input.slice(0, 40) + (input.length > 40 ? '...' : '') 
          })
          .select()
          .single();
        
        if (newChat) {
          activeChatId = newChat.id;
          router.replace(`/porto?chatId=${activeChatId}`, { scroll: false });
        }
      }

      // 2. Salvar mensagem do usuário
      if (activeChatId) {
        await supabase.from('messages').insert({
          chat_id: activeChatId,
          role: 'user',
          content: userMessage.content
        });
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...currentMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Desculpe, tive um problema na navegação. Pode repetir?";
      
      const botMessage = { id: (Date.now()+1).toString(), role: 'assistant', content: botText };
      
      // Sincronização cuidadosa: desativar loading ANTES de adicionar a mensagem para evitar o "balão duplo"
      setIsLoading(false);
      setMessages(prev => [...prev, botMessage]);

      // 3. Salvar mensagem do bot e gerar resumo
      if (activeChatId) {
        await supabase.from('messages').insert({
          chat_id: activeChatId,
          role: 'assistant',
          content: botText
        });

        // 4. Gerar Resumo se for a primeira troca (mensagens: User + Assistant)
        if (currentMessages.length === 1) {
          try {
            const summaryResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                  { role: "system", content: "Gere um resumo ultra curto (máximo 4 palavras) para o tema desta conversa. Responda APENAS o resumo, sem pontuação extra ou introdução." },
                  { role: "user", content: input || userMessage.content }
                ],
                temperature: 0.5,
              }),
            });
            const summaryData = await summaryResponse.json();
            const summary = summaryData.choices?.[0]?.message?.content?.replace(/["']/g, '');
            if (summary) {
              await supabase.from('chats').update({ title: summary }).eq('id', activeChatId);
            }
          } catch (e) {
            console.error("Erro ao gerar resumo:", e);
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: "⚠️ Sinal fraco no Porto. Verifique sua conexão." }]);
    } finally {
      setIsLoading(false);
      // Resetar o flag após um pequeno delay para garantir que o useEffect do chatId não pegue
      setTimeout(() => {
        isInitializingNewChat.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const initialize = async () => {
      // Se estamos no meio de criar um chat novo no handleSendMessage, NÃO sobrescrevemos o estado
      if (isInitializingNewChat.current) return;

      // Se já temos mensagens e o chatId não mudou drasticamente (ou seja, não estamos vindo de uma navegação lateral)
      // poderíamos evitar o fetch, mas para garantir sincronia com histórico, fazemos o fetch apenas se chatId existir
      if (chatId) {
        const { data: history } = await supabase.from('messages').select('id, role, content').eq('chat_id', chatId).order('created_at', { ascending: true });
        if (history && history.length > 0) {
          setMessages(history.map(m => ({ id: m.id, role: m.role, content: m.content })));
        }
      } else {
        // Nova conversa (sem chatId)
        const pool = greetingPool[humor] || greetingPool.default;
        const initialGreeting = pool[Math.floor(Math.random() * pool.length)];
        setMessages([{ id: 'welcome', role: 'assistant', content: initialGreeting }]);
      }
    };
    initialize();
  }, [chatId, humor]); // Removi o messages.length da dependência para evitar loops, e agora ele limpa se chatId for nulo.

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Tentar encontrar o melhor tipo suportado
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
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'pt');

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setInput(data.text);
        // Opcional: Enviar automaticamente após transcrever
        // handleSendMessage(null, data.text);
      }
    } catch (err) {
      console.error("Erro na transcrição:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 44 ? `${scrollHeight}px` : '44px';
    }
  }, [input]);

  return (
    <main className="fixed inset-0 bg-[#FDFCF7] flex flex-col overflow-hidden selection:bg-emerald-500/10">
      <AnimatedBackground subtle={false} />
      <ChatHistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {!isMounted ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="text-emerald-500 animate-spin" size={32} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col h-full w-full"
        >

      {/* HEADER: White Mode */}
      <header className="relative flex-none flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-30 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')} 
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 shadow-sm active:scale-95 transition-all hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">O PORTO</h2>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Refúgio Seguro</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsHistoryOpen(true)} 
          className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 flex items-center gap-2 hover:bg-slate-100 transition-all"
        >
          <Clock size={18} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
        </motion.button>
      </header>

      {/* ÁREA CENTRAL - ROLAGEM CORRIGIDA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 relative z-10 overscroll-contain">
        <div className="max-w-3xl w-full mx-auto space-y-8 pb-32">
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((m) => (
              <motion.div 
                key={m.id} 
                layout
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ 
                  duration: 0.2, 
                  ease: "easeOut",
                  layout: { duration: 0.2 }
                }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-emerald-500 border border-slate-100'}`}>
                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl border ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <b className="font-black text-emerald-500" {...props} />,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Bot size={20} className="text-emerald-500" />
              </div>
              <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center justify-center min-w-[80px]">
                <div className="flex gap-1.5">
                  <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Animação de "Ouvindo" para o Usuário */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="flex justify-end gap-3"
              >
                <div className="bg-slate-900 p-5 rounded-[2rem] rounded-tr-none shadow-xl flex items-center justify-center min-w-[80px] border border-slate-800">
                  <div className="flex gap-1.5">
                    <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-lg border border-slate-800 animate-pulse">
                  <User size={20} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* INPUT CARD: ChatGPT Style */}
      <div className="flex-none p-4 md:p-6 bg-transparent z-40 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <form 
          onSubmit={handleSendMessage} 
          className="max-w-3xl mx-auto flex items-center gap-2 bg-white border border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem] p-1.5 focus-within:ring-4 ring-emerald-500/20 transition-all min-h-[52px]"
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
            onFocus={() => window.dispatchEvent(new CustomEvent('toggleDock', { detail: false }))}
            onBlur={() => window.dispatchEvent(new CustomEvent('toggleDock', { detail: true }))}
            placeholder={isRecording ? "Ouvindo você..." : isTranscribing ? "Processando voz..." : "Conversar com Nórica..."} 
            className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 text-sm font-semibold placeholder-slate-400/80 resize-none max-h-40 min-h-[44px] custom-scrollbar leading-relaxed overflow-y-auto" 
            rows={1}
          />
          
          <div className="flex items-center justify-center pr-1.5 h-full">
            <AnimatePresence mode="wait">
              {!input.trim() && !isTranscribing ? (
                <motion.button
                  key="mic"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : isTranscribing ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-50 text-slate-400 hover:text-emerald-500'}`}
                >
                  {isTranscribing ? <Loader2 className="animate-spin" size={20} /> : isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>
              ) : (
                <motion.button 
                  key="send"
                  initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
      </motion.div>
      )}
    </main>
);
}

export default function PortoPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#FDFCF7] flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatedBackground subtle={false} />
        <Loader2 className="text-emerald-500 animate-spin relative z-10" size={32} />
      </div>
    }>
      <PortoContent />
    </Suspense>
  );
}
