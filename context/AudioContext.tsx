"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AudioContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true); // Começa mutado por padrão (boas práticas)

  // Persistência simples
  useEffect(() => {
    const saved = localStorage.getItem('ancora_muted');
    if (saved !== null) {
      setIsMuted(saved === 'true');
    }
  }, []);

  const handleSetMuted = (muted: boolean) => {
    setIsMuted(muted);
    localStorage.setItem('ancora_muted', muted.toString());
  };

  return (
    <AudioContext.Provider value={{ isMuted, setIsMuted: handleSetMuted }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
