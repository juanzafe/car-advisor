import { useCallback, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle } from './lib/firebase';
import { carService } from './services/carService';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { CarsGrid } from './components/cars/CarsGrid';
import { ComparisonGrid } from './components/comparison/ComparisonGrid';
import { PreferenceFilters } from './components/search/PreferenceFilters';
import { FavoritesView } from './components/cars/FavoritesView';
import { Star } from 'lucide-react';
import type { CarSpec, Preferences } from './types/car';

export default function App() {
  const [user, authLoading] = useAuthState(auth);
  const [view, setView] = useState<'home' | 'favorites'>('home');
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

  const search = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        const results = await carService.fetchCars(query);
        const scoredCars = results
          .map((car) => ({
            ...car,
            score: carService.calculateScore(car, preferences),
          }))
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setCars(scoredCars);
      } catch (error) {
        console.error('Error fetching cars', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    },
    [preferences]
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
      <Header view={view} setView={setView} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {view === 'home' ? (
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

            <CarsGrid
              cars={cars}
              isLoading={loading}
              onCompare={addToCompare}
              selectedIds={selected.map((c) => c.id)}
            />
          </>
        ) : (
          <FavoritesView
            onCompare={addToCompare}
            selectedIds={selected.map((c) => c.id)}
          />
        )}

        {selected.length > 0 && (
          <ComparisonGrid cars={selected} onRemove={removeFromCompare} />
        )}
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-100 mt-12">
        <p>© 2026 CarAdvisor Pro - juanzamudiofdez@gmail.com</p>
      </footer>
    </div>
  );
}
