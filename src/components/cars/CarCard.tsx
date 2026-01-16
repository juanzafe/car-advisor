import { Zap, Fuel, Gauge, Car, Star } from 'lucide-react';
import { CarImage } from './CarImage';
import type { CarSpec } from '../../types/car';

export const CarCard = ({
  car,
  onCompare,
  isSelected,
}: {
  car: CarSpec;
  onCompare: () => void;
  isSelected: boolean;
}) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden relative border border-slate-100">
    {/* El z-10 asegura que se vea por encima de la imagen */}
    {car.score !== undefined && (
      <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
        <Star size={14} fill="currentColor" />
        <span>{car.score}%</span>
      </div>
    )}

    <CarImage car={car} />

    <div className="p-5 space-y-4">
      <div>
        <h3 className="font-bold text-lg leading-tight">
          {car.brand} {car.model}
        </h3>
        <p className="text-sm text-slate-500">{car.year}</p>
      </div>

      <div className="text-sm space-y-2 border-y border-slate-50 py-3">
        <div className="flex justify-between items-center text-slate-600">
          <span className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500" /> Potencia
          </span>
          <span className="font-semibold text-slate-900">{car.hp} CV</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span className="flex items-center gap-2">
            <Fuel size={16} className="text-blue-500" /> Consumo
          </span>
          <span className="font-semibold text-slate-900">
            {car.consumption} L
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span className="flex items-center gap-2">
            <Gauge size={16} className="text-blue-500" /> Peso
          </span>
          <span className="font-semibold text-slate-900">{car.weight} kg</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span className="flex items-center gap-2">
            <Car size={16} className="text-blue-500" /> Tracción
          </span>
          <span className="font-semibold text-slate-900">{car.traction}</span>
        </div>
      </div>

      <button
        onClick={onCompare}
        disabled={isSelected}
        className={`w-full py-2.5 rounded-xl font-bold transition-all duration-200 ${
          isSelected
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 shadow-sm active:scale-[0.98]'
        }`}
      >
        {isSelected ? 'Ya en comparativa' : 'Comparar ahora'}
      </button>
    </div>
  </div>
);
