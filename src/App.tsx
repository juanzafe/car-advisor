import { useCallback, useState, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle } from './lib/firebase';
import { carService } from './services/carService';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { CarsGrid } from './components/cars/CarsGrid';
import { ComparisonGrid } from './components/comparison/ComparisonGrid';
import { PreferenceFilters } from './components/search/PreferenceFilters';
import { FavoritesView } from './components/cars/FavoritesView';
import PrivacyPolicy from './pages/PrivacyPolicy'; // Importa la página que creamos
import { Star } from 'lucide-react';
import type { CarSpec, Preferences } from './types/car';

export default function App() {
  const [user, authLoading] = useAuthState(auth);
  // Añadimos 'privacy' a los estados posibles de la vista
  const [view, setView] = useState<'home' | 'favorites' | 'privacy'>('home');
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

  const resultsRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        // Si buscamos algo, volvemos a la home automáticamente
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

  const addToCompare = useCallback((car: CarSpec) => {
    setSelected((prev) =>
      prev.some((c) => c.id === car.id) ? prev : [...prev, car]
    );
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setSelected((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header view={view === 'privacy' ? 'home' : view} setView={setView} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Renderizado condicional de las 3 vistas */}
        {view === 'privacy' ? (
          <PrivacyPolicy />
        ) : view === 'home' ? (
          <>
            <section className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900">
                {user
                  ? `¡Hola, ${user.displayName?.split(' ')[0]}! 👋`
                  : 'Encuentra tu coche ideal'}
              </h2>
              <p className="text-slate-600">
                Compara especificaciones técnicas y elige con datos reales.
              </p>
            </section>

            <SearchBar onSearch={search} isLoading={loading} />

            {!user && cars.length > 0 && (
              <div className="bg-blue-600 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg">
                <p className="font-medium flex items-center gap-2">
                  <Star size={18} fill="white" /> ¡Guarda tus favoritos
                  iniciando sesión!
                </p>
                <button
                  onClick={loginWithGoogle}
                  className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm"
                >
                  Acceder
                </button>
              </div>
            )}

            <PreferenceFilters
              preferences={preferences}
              setPreferences={setPreferences}
            />

            {selected.length > 0 && (
              <ComparisonGrid cars={selected} onRemove={removeFromCompare} />
            )}

            <div ref={resultsRef} className="scroll-mt-10">
              <CarsGrid
                cars={cars}
                isLoading={loading}
                onCompare={addToCompare}
                selectedIds={selected.map((c) => c.id)}
              />
            </div>
          </>
        ) : (
          <FavoritesView
            onCompare={addToCompare}
            selectedIds={selected.map((c) => c.id)}
          />
        )}
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-100 mt-12">
        <p>© 2026 CarAdvisor Pro - juanzamudiofdez@gmail.com</p>
        <div className="mt-4 flex justify-center gap-6">
          <button
            onClick={() => setView('privacy')}
            className="hover:text-blue-600 underline decoration-slate-200"
          >
            Política de Privacidad
          </button>
        </div>
      </footer>
    </div>
  );
}
