import { auth, loginWithGoogle } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, LogOut, CarFront } from 'lucide-react';

interface HeaderProps {
  selectedCount: number;
}

export const Header = ({ selectedCount }: HeaderProps) => {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* LOGO MEJORADO */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl shadow-xl shadow-blue-200 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
            <CarFront className="text-white" size={32} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col">
            <h1 className="text-5xl font-black tracking-tighter leading-none uppercase flex items-center">
              <span className="italic bg-clip-text text-transparent bg-linear-to-r from-slate-900 via-blue-900 to-blue-600 pr-3">
                Car-Advisor
              </span>
              <span className="text-blue-600 drop-shadow-[0_2px_2px_rgba(37,99,235,0.3)] not-italic">
                PRO
              </span>
            </h1>
            {/* Una pequeña línea decorativa que se expande al hacer hover */}
            <div className="h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full" />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex items-center gap-8">
          {/* COMPARADOR BADGE */}
          {selectedCount > 0 && (
            <div className="relative flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span className="text-sm font-bold text-blue-700">
                {selectedCount} {selectedCount === 1 ? 'Coche' : 'Coches'}{' '}
                listos
              </span>
            </div>
          )}

          {/* AUTH SECTION */}
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-900 leading-none mb-1">
                  {user.displayName?.split(' ')[0]}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 justify-end ml-auto"
                >
                  Salir <LogOut size={10} />
                </button>
              </div>

              <div className="relative group shadow-xl rounded-full">
                <img
                  src={user.photoURL || ''}
                  alt="Perfil"
                  className="w-11 h-11 rounded-full border-2 border-white ring-2 ring-blue-500/20 group-hover:ring-blue-500 transition-all cursor-pointer"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="group relative flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 active:scale-95"
            >
              <LogIn
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
              Acceso Clientes
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
