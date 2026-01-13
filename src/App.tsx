import { useState } from 'react';

import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { SearchResults } from './components/search/SearchResults';
import { CompareSection } from './components/compare/CompareSection';
import { FilterCard } from './components/CarUi';

import { Zap, Fuel, Gauge, DollarSign } from 'lucide-react';
import { useCars } from './hooks/useCars';
import type { CarSpec } from './types/Car';

const App = () => {
  const [query, setQuery] = useState('');
  const [selectedCars, setSelectedCars] = useState<CarSpec[]>([]);

  const { results, loading, error, search } = useCars();

  const addCar = (car: CarSpec) => {
    setSelectedCars(prev =>
      prev.find(c => c.id === car.id) ? prev : [...prev, car]
    );
  };

  const removeCar = (id: string) => {
    setSelectedCars(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      <Header selectedCount={selectedCars.length} />

      <main className="max-w-7xl mx-auto p-6">
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-10 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">
            ¿Qué buscas en tu próximo coche?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <FilterCard icon={<Zap className="text-yellow-500" />} label="Potencia" desc="Más de 200 CV" />
            <FilterCard icon={<Fuel className="text-green-500" />} label="Eficiencia" desc="Bajo consumo" />
            <FilterCard icon={<Gauge className="text-purple-500" />} label="Ligereza" desc="Menos de 1500kg" />
            <FilterCard icon={<DollarSign className="text-blue-500" />} label="Precio" desc="Mejor relación" />
          </div>

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={() => search(query)}
            loading={loading}
          />

          {error && <p className="mt-6 text-red-500">{error}</p>}

          <SearchResults cars={results} onAdd={addCar} />
        </section>

        <CompareSection cars={selectedCars} onRemove={removeCar} />
      </main>
    </div>
  );
};

export default App;
