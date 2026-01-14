
import { X } from 'lucide-react';
import type { CarSpec } from '../../types/car';

export const ComparisonGrid = ({
  cars,
  onRemove
}: {
  cars: CarSpec[];
  onRemove: (id: string) => void;
}) => {
  if (!cars.length) return null;

  return (
    <section className="bg-blue-50 p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Comparativa</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {cars.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl relative">
            <button onClick={() => onRemove(c.id)} className="absolute top-2 right-2 text-red-500">
              <X />
            </button>
            <h3 className="font-bold">{c.brand} {c.model}</h3>
            <p className="text-sm">{c.hp} CV · {c.consumption} L</p>
          </div>
        ))}
      </div>
    </section>
  );
};
