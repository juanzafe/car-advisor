import type { CarSpec } from '../../types/car';
import { CarCard } from './CarCard';

interface CarsGridProps {
  cars: CarSpec[];
  onCompare: (car: CarSpec, color: string) => void;
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-24 h-4 rounded-full skeleton-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                height: 420,
              }}
            >
              <div className="skeleton-pulse h-52 w-full" />
              <div className="p-5 space-y-3">
                <div className="skeleton-pulse h-3 w-20 rounded-full" />
                <div className="skeleton-pulse h-5 w-32 rounded-full" />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="skeleton-pulse h-7 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cars.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="text-5xl mb-2" style={{ filter: 'grayscale(0.3)' }}>
          🚗
        </div>
        <p className="text-slate-400 text-lg font-semibold">
          {lang === 'es'
            ? 'Busca una marca para ver resultados'
            : 'Search for a brand to see results'}
        </p>
        <p className="text-slate-600 text-sm">
          {lang === 'es'
            ? 'Prueba con BMW, Toyota, Porsche...'
            : 'Try BMW, Toyota, Porsche...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-400 text-sm">
          <span className="text-white font-bold">{cars.length}</span>{' '}
          {lang === 'es' ? 'resultados encontrados' : 'results found'}
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-slate-500 text-xs">
            {lang === 'es' ? 'Ordenado por puntuación' : 'Sorted by score'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, i) => (
          <div
            key={car.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${i * 60}ms`,
              animationDuration: '400ms',
            }}
          >
            <CarCard
              car={car}
              onCompare={(color) => onCompare(car, color)}
              isSelected={selectedIds?.includes(car.id) || false}
              lang={lang}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
