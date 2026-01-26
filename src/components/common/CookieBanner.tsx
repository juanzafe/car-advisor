import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CookieBannerProps {
  lang: 'es' | 'en';
}

export const CookieBanner = ({ lang }: CookieBannerProps) => {
  // Inicializamos el estado consultando localStorage directamente
  const [isVisible, setIsVisible] = useState(() => {
    const consent = localStorage.getItem('cookie-consent');
    return !consent; // Si no hay consent, es visible
  });

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const content = {
    es: {
      text: 'Utilizamos cookies para mejorar tu experiencia y mostrarte anuncios personalizados a través de Google AdSense.',
      button: 'Aceptar',
      policy: 'Política de Cookies',
    },
    en: {
      text: 'We use cookies to improve your experience and show you personalized ads through Google AdSense.',
      button: 'Accept',
      policy: 'Cookie Policy',
    },
  };

  const t = content[lang];

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-100 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {t.text}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={acceptCookies}
                className="bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                {t.button}
              </button>
              <button className="text-xs text-slate-400 hover:text-slate-600 font-medium underline">
                {t.policy}
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-300 hover:text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
