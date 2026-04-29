/**
 * Utilitários para chamadas de API em ambientes híbridos (Web/Capacitor)
 */

export const getApiUrl = (path: string) => {
  // Se estiver em produção (build nativo), precisamos de uma URL absoluta
  const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNative;
  
  // URL de produção do seu backend (Vercel/Netlify/etc)
  // Substitua pela sua URL real se necessário
  const prodUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ancora-web.vercel.app'; 
  
  if (isNative) {
    // Remove barras duplicadas
    const baseUrl = prodUrl.endsWith('/') ? prodUrl.slice(0, -1) : prodUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
  
  return path;
};
