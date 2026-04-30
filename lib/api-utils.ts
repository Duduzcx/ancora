/**
 * Utilitários para chamadas de API em ambientes híbridos (Web/Capacitor)
 */

// URL de produção do seu backend no Netlify
export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Forçamos a URL absoluta para o Netlify
  const finalUrl = `https://ancura.netlify.app${cleanPath}`;
  
  console.log("%c [API-DEBUG] Tentando conexão com:", "color: #00ff00; font-weight: bold;", finalUrl);
  
  return finalUrl;
};
