import { Capacitor } from '@capacitor/core';

/**
 * Retorna a URL de redirecionamento correta baseada na plataforma.
 * Se estiver no Capacitor (Android/iOS), usa o custom schema com.zcx.norica://auth/callback
 * Se estiver no Navegador, usa a URL do site de produção.
 */
export const getRedirectUrl = () => {
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative) {
    // Schema customizado configurado no AndroidManifest.xml do Capacitor
    return 'com.zcx.norica://auth/callback';
  }

  // Fallback para Web / Produção
  return 'https://norica.netlify.app/auth/callback';
};
