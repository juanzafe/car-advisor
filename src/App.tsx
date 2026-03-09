import { useCallback, useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle } from './lib/firebase';
import { carService } from './services/carService';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { CarsGrid } from './components/cars/CarsGrid';
import { ComparisonGrid } from './components/comparison/ComparisonGrid';
import { PreferenceFilters } from './components/search/PreferenceFilters';
import { FavoritesView } from './components/cars/FavoritesView';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { Star, Trash2 } from 'lucide-react';
import { translations } from './locales/translations';
import type { CarSpec, Preferences } from './types/car';
import { CookieBanner } from './components/common/CookieBanner';

export default function App() {
  const [user, authLoading] = useAuthState(auth);
  const [view, setView] = useState<'home' | 'favorites' | 'privacy'>('home');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [cars, setCars] = useState<CarSpec[]>([]);
  const [selected, setSelected] = useState<CarSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    minPower: 150,
    maxConsumption: 8,
    maxWeight: 1600,
    maxPrice: 40000,
    preferredTraction: 'any',
  });

  const t = translations[lang];
  const resultsRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected.length > 0) {
      comparisonRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selected.length]);

  const search = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        if (view !== 'home') setView('home');
        const results = await carService.fetchCars(query);
        const scoredCars = results
          .map((car) => ({
            ...car,
            score: carService.calculateScore(car, preferences),
          }))
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setCars(scoredCars);
        if (results.length > 0) {
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching cars', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    },
    [preferences, view]
  );

  const addToCompare = useCallback((car: CarSpec, color: string) => {
    setSelected((prev) => {
      if (prev.some((c) => c.id === car.id)) return prev;
      const carWithColor = { ...car, selectedColor: color };
      return [...prev, carWithColor];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setSelected((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearComparison = () => setSelected([]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-2 border-t-blue-500 border-blue-500/10 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg">
      <Header
        view={view === 'privacy' ? 'home' : view}
        setView={setView}
        lang={lang}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Language switcher */}
        <div className="flex justify-end gap-1.5">
          {(['es', 'en'] as const).map((l) => (
            <button
              key={l}
              data-testid={`lang-${l}`}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                lang === l
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-500 hover:text-slate-300 glass-card'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {view === 'privacy' ? (
          <PrivacyPolicy />
        ) : (
          <>
            {view === 'home' && (
              <>
                {/* Hero section */}
                <section className="space-y-3 py-6">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400 text-sm font-semibold">
                          {lang === 'es'
                            ? '¡Bienvenido de vuelta!'
                            : 'Welcome back!'}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tight gradient-text leading-tight">
                        {`${lang === 'es' ? 'Hola' : 'Hello'}, ${user.displayName?.split(' ')[0]}`}
                      </h2>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl md:text-6xl font-black tracking-tight gradient-text leading-[1.1]">
                        {t.welcome}
                      </h2>
                    </>
                  )}
                  <p className="text-slate-400 text-lg max-w-xl">
                    {t.subtitle}
                  </p>
                </section>

                <SearchBar onSearch={search} isLoading={loading} lang={lang} />

                {!user && cars.length > 0 && (
                  <div className="glass-card rounded-2xl p-4 flex justify-between items-center border border-blue-500/20">
                    <p className="font-medium flex items-center gap-2 text-slate-300">
                      <Star
                        size={18}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      {t.loginToSave}
                    </p>
                    <button
                      onClick={loginWithGoogle}
                      className="btn-glow text-white px-5 py-2 rounded-xl font-bold text-sm"
                    >
                      {t.access}
                    </button>
                  </div>
                )}

                <PreferenceFilters
                  preferences={preferences}
                  setPreferences={setPreferences}
                  lang={lang}
                />
              </>
            )}

            <div ref={comparisonRef} className="scroll-mt-24">
              {selected.length > 0 && (
                <section
                  data-testid="comparison-panel"
                  className="animate-in fade-in slide-in-from-top-4 duration-500"
                >
                  <div className="flex items-center justify-between mb-4 glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full" />
                      <h3 className="text-xl font-bold text-white">
                        {t.comparison}
                      </h3>
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                        {selected.length}
                      </span>
                    </div>
                    <button
                      data-testid="clear-comparison"
                      onClick={clearComparison}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} /> {t.clearAll}
                    </button>
                  </div>
                  <ComparisonGrid
                    cars={selected}
                    onRemove={removeFromCompare}
                  />
                </section>
              )}
            </div>

            <div ref={resultsRef} className="scroll-mt-10">
              {view === 'home' ? (
                <CarsGrid
                  cars={cars}
                  isLoading={loading}
                  onCompare={addToCompare}
                  selectedIds={selected.map((c) => c.id)}
                  lang={lang}
                />
              ) : (
                <FavoritesView
                  onCompare={addToCompare}
                  selectedIds={selected.map((c) => c.id)}
                  lang={lang}
                />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="py-12 text-center text-slate-600 text-sm border-t border-white/5 mt-16">
        <p className="text-slate-500">
          © 2026 CarAdvisor Pro — {t.footerEmail}
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <button
            onClick={() => setView('privacy')}
            className="hover:text-blue-400 transition-colors text-slate-600"
          >
            {t.privacy}
          </button>
        </div>
      </footer>

      <CookieBanner lang={lang} />
    </div>
  );
}
