/**
 * Utilitários para chamadas de API em ambientes híbridos (Web/Capacitor)
 */

// URL de produção do seu backend no Netlify
const prodUrl = 'https://ancura.netlify.app'; 

export const getApiUrl = (path: string) => {
  // Garante que o path comece com /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Log para debug no Android Studio
  const finalUrl = `${prodUrl}${cleanPath}`;
  console.log('[API] Chamada para:', finalUrl);
  
  return finalUrl;
};
