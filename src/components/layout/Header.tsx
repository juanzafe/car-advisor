import { auth, loginWithGoogle } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, CarFront, Heart, Search, LogOut } from 'lucide-react';
import { translations } from '../../locales/translations';

interface HeaderProps {
  view: 'home' | 'favorites';
  setView: (view: 'home' | 'favorites') => void;
  lang?: 'es' | 'en';
}

export const Header = ({ view, setView, lang = 'es' }: HeaderProps) => {
  const [user] = useAuthState(auth);
  const t = translations[lang];

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 md:px-6 h-18 flex justify-between items-center"
        style={{ height: '72px' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => setView('home')}
        >
          <div
            className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
            }}
          >
            <CarFront
              className="text-white w-6 h-6 md:w-7 md:h-7"
              strokeWidth={2.5}
            />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase hidden sm:block leading-none">
            <span
              className="italic inline-block"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Car-Advisor
            </span>
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              PRO
            </span>
          </h1>
        </div>

        {/* Nav */}
        <nav
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {[
            { key: 'home', icon: <Search size={17} />, label: t.explore },
            {
              key: 'favorites',
              icon: (
                <Heart
                  size={17}
                  className={view === 'favorites' ? 'fill-red-400' : ''}
                />
              ),
              label: t.favorites,
            },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key as 'home' | 'favorites')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === key
                  ? key === 'favorites'
                    ? 'text-red-500'
                    : 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              style={
                view === key
                  ? {
                      background: 'rgba(59,130,246,0.1)',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.1)',
                    }
                  : {}
              }
            >
              {icon}
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => signOut(auth)}
                className="md:hidden p-2 text-slate-600 hover:text-red-500 transition-colors"
                aria-label={t.logout}
              >
                <LogOut size={20} />
              </button>

              <div className="hidden md:block text-right">
                <p className="text-sm font-black text-slate-800 leading-none">
                  {user.displayName?.split(' ')[0]}
                </p>
                <button
                  onClick={() => signOut(auth)}
                  className="text-xs uppercase text-slate-600 hover:text-red-500 font-bold cursor-pointer transition-colors tracking-wider"
                >
                  {t.logout}
                </button>
              </div>

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full"
                  style={{
                    border: '2px solid rgba(59,130,246,0.4)',
                    boxShadow: '0 0 12px rgba(59,130,246,0.3)',
                  }}
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  }}
                >
                  {user.displayName?.[0]}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold btn-glow transition-all"
            >
              <LogIn size={18} />
              <span className="hidden xs:inline">{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
