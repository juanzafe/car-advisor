import { Plus } from 'lucide-react';
import type { CarSpec } from '../../types/Car';

interface SearchResultsProps {
  cars: CarSpec[];
  onAdd: (car: CarSpec) => void;
}

export const SearchResults = ({ cars, onAdd }: SearchResultsProps) => {
  if (cars.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold mb-4">Resultados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <div
            key={car.id}
            className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col"
          >
            <img
              src={car.image}
              alt={car.model}
              className="h-40 w-full object-cover rounded-xl mb-4"
            />

            <h4 className="font-bold text-lg">
              {car.brand} {car.model}
            </h4>
            <p className="text-sm text-gray-500 mb-3">{car.year}</p>

            <div className="text-sm space-y-1 mb-4">
              <p>⚡ {car.hp} CV</p>
              <p>⛽ {car.consumption} MPG</p>
              <p>⚖️ {car.weight} kg</p>
            </div>

            <button
              onClick={() => onAdd(car)}
              className="mt-auto bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Añadir al comparador
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
