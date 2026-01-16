import { useCallback, useState, useEffect } from 'react';
import type { CarSpec, Preferences } from './types/car';
import { carService } from './services/carService';

import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { CarsGrid } from './components/cars/CarsGrid';
import { ComparisonGrid } from './components/comparison/ComparisonGrid';
import { PreferenceFilters } from './components/search/PreferenceFilters';

export default function App() {
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

        // DEBUG: ¿Cuántos llegan aquí?
        console.log('Total resultados en App:', results.length);

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

  // EFECTO DINÁMICO: Recalcula el score cuando cambias los sliders sin recargar la API
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
  }, [preferences]); // Se lanza cada vez que mueves un slider

  const addToCompare = useCallback((car: CarSpec) => {
    setSelected((prev) =>
      prev.some((c) => c.id === car.id) ? prev : [...prev, car]
    );
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setSelected((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <>
      <Header selectedCount={selected.length} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <SearchBar onSearch={search} isLoading={loading} />

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

        {selected.length > 0 && (
          <ComparisonGrid cars={selected} onRemove={removeFromCompare} />
        )}
      </main>
    </>
  );
}
