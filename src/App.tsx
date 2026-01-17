import { useCallback, useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle } from './lib/firebase';
import { carService } from './services/carService';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { CarsGrid } from './components/cars/CarsGrid';
import { ComparisonGrid } from './components/comparison/ComparisonGrid';
import { PreferenceFilters } from './components/search/PreferenceFilters';
import { Star } from 'lucide-react';
import type { CarSpec, Preferences } from './types/car';

export default function App() {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [user, authLoading] = useAuthState(auth);

  // --- ESTADOS DE LA APLICACIÓN ---
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

  // --- LÓGICA DE BÚSQUEDA ---
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

  // --- RECALCULAR SCORES CUANDO CAMBIAN PREFERENCIAS ---
  useEffect(() => {
    if (cars.length > 0) {
      const updatedCars = cars
        .map((car) => ({
          ...car,
          score: carService.calculateScore(car, preferences),
        }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      setCars(updatedCars);
    }
  }, [preferences]);

  // --- GESTIÓN DE COMPARATIVA ---
  const addToCompare = useCallback((car: CarSpec) => {
    setSelected((prev) =>
      prev.some((c) => c.id === car.id) ? prev : [...prev, car]
    );
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setSelected((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Pantalla de carga inicial de Firebase
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">
            Cargando CarAdvisor Pro...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Pasamos el conteo de seleccionados al Header donde está el Login */}
      <Header />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Banner de Bienvenida Personalizado */}
        <section className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">
            {user
              ? `¡Hola, ${user.displayName?.split(' ')[0]}! 👋`
              : 'Encuentra tu coche ideal'}
          </h2>
          <p className="text-slate-600">
            {user
              ? 'Tus coches favoritos se guardarán automáticamente en tu cuenta.'
              : 'Compara especificaciones técnicas y encuentra la mejor opción para ti.'}
          </p>
        </section>

        <SearchBar onSearch={search} isLoading={loading} />

        {/* Banner de Login (solo si no está logueado y hay resultados) */}
        {!user && cars.length > 0 && (
          <div className="bg-blue-600 rounded-2xl p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Star size={20} fill="white" />
              </div>
              <p className="font-medium text-center md:text-left">
                Inicia sesión para guardar tus coches favoritos.
              </p>
            </div>
            <button
              onClick={() => loginWithGoogle()}
              className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Acceder con Google
            </button>
          </div>
        )}

        {/* Sección de Comparativa */}
        {selected.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <ComparisonGrid cars={selected} onRemove={removeFromCompare} />
          </div>
        )}

        {/* Filtros de Preferencias */}
        <PreferenceFilters
          preferences={preferences}
          setPreferences={setPreferences}
        />

        {/* Parrilla de Resultados */}
        <CarsGrid
          cars={cars}
          isLoading={loading}
          onCompare={addToCompare}
          selectedIds={selected.map((c) => c.id)}
        />
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2026 CarAdvisor Pro - Comparador de alta precisión</p>
      </footer>
    </div>
  );
}
