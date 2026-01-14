import { useCallback, useMemo, useState } from 'react';
import type { CarSpec, Preferences } from './types/car';
import { carService } from './services/carService';

import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { CarsGrid } from './components/cars/CarsGrid';
import { ComparisonGrid } from './components/comparison/ComparisonGrid';

export default function App() {
  const [cars, setCars] = useState<CarSpec[]>([]);
  const [selected, setSelected] = useState<CarSpec[]>([]);
  const [loading, setLoading] = useState(false);

  /* =====================
   * USER PREFERENCES
   * ===================== */
  const preferences: Preferences = useMemo(
    () => ({
      minPower: 150,
      maxConsumption: 8,
      maxWeight: 1600,
      maxPrice: 40000,
      preferredTraction: 'any'
    }),
    []
  );

  /* =====================
   * SEARCH HANDLER
   * ===================== */
  const search = useCallback(async (query: string) => {
    try {
      setLoading(true);

      const results = await carService.fetchCars(query);

      const scoredCars = results
        .map(car => ({
          ...car,
          score: carService.calculateScore(car, preferences)
        }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      setCars(scoredCars);
    } catch (error) {
      console.error('Error fetching cars', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  /* =====================
   * COMPARISON HANDLERS
   * ===================== */
  const addToCompare = useCallback((car: CarSpec) => {
    setSelected(prev =>
      prev.some(c => c.id === car.id) ? prev : [...prev, car]
    );
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setSelected(prev => prev.filter(c => c.id !== id));
  }, []);

  /* =====================
   * RENDER
   * ===================== */
  return (
    <>
      <Header selectedCount={selected.length} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <SearchBar onSearch={search} isLoading={loading} />

        <CarsGrid
          cars={cars}
          isLoading={loading}
          onCompare={addToCompare}
        />

        {selected.length > 0 && (
          <ComparisonGrid
            cars={selected}
            onRemove={removeFromCompare}
          />
        )}
      </main>
    </>
  );
}
