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
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
        <div
          className="flex items-center gap-2 md:gap-4 group cursor-pointer"
          onClick={() => setView('home')}
        >
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-2 rounded-xl md:p-2.5 md:rounded-2xl shadow-xl shadow-blue-200 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
            <CarFront
              className="text-white w-6 h-6 md:w-8 md:h-8"
              strokeWidth={2.5}
            />
          </div>
          <h1 className="text-xl md:text-4xl font-black tracking-tighter uppercase hidden sm:block">
            <span className="italic bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-blue-600 pr-1">
              Car-Advisor
            </span>
            <span className="text-blue-600">PRO</span>
          </h1>
        </div>

        <nav className="flex items-center gap-1 md:gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView('home')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              view === 'home'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search size={18} />
            <span className="hidden md:inline">{t.explore}</span>
          </button>
          <button
            onClick={() => setView('favorites')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              view === 'favorites'
                ? 'bg-white text-red-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Heart
              size={18}
              className={view === 'favorites' ? 'fill-red-500' : ''}
            />
            <span className="hidden md:inline">{t.favorites}</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => signOut(auth)}
                className="md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
                aria-label={t.logout}
              >
                <LogOut size={20} />
              </button>

              <div className="hidden md:block text-right">
                <p className="text-s font-black text-slate-900 leading-none">
                  {user.displayName?.split(' ')[0]}
                </p>
                <button
                  onClick={() => signOut(auth)}
                  className="text-[15px] uppercase text-slate-400 hover:text-red-500 font-bold cursor-pointer transition-colors"
                >
                  {t.logout}
                </button>
              </div>

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-blue-500/20"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                  {user.displayName?.[0]}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 md:p-2.5 rounded-xl hover:bg-blue-600 transition-all text-sm md:text-base"
            >
              <LogIn size={20} />
              <span className="hidden xs:inline">{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
