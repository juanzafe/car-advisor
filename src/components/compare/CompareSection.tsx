import { Car } from 'lucide-react';
import type { CarSpec } from '../../types/Car';
import { ComparisonCard } from '../CarUi';

interface CompareSectionProps {
  cars: CarSpec[];
  onRemove: (id: string) => void;
}

export const CompareSection = ({ cars, onRemove }: CompareSectionProps) => {
  if (cars.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Car size={48} className="mx-auto mb-4 opacity-20" />
        <p>No hay coches seleccionados para comparar.</p>
      </div>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Comparativa Directa</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <ComparisonCard
            key={car.id}
            car={car}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
};
