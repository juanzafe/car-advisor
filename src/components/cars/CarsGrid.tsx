import type { CarSpec } from '../../types/car';
import { CarCard } from './CarCard';

interface CarsGridProps {
  cars: CarSpec[];
  onCompare: (car: CarSpec) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  lang: 'es' | 'en';
}

export function CarsGrid({
  cars,
  lang,
  onCompare,
  selectedIds,
  isLoading = false,
}: CarsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-slate-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!cars.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        {lang === 'es'
          ? 'Busca una marca para ver resultados'
          : 'Search for a brand to see results'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          onCompare={() => onCompare(car)}
          isSelected={selectedIds?.includes(car.id) || false}
          lang={lang}
        />
      ))}
    </div>
  );
}
