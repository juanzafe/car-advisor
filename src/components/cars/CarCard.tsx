
import { Zap, Fuel, Gauge, Car, Star } from 'lucide-react';
import { CarImage } from './CarImage';
import type { CarSpec } from '../../types/car';

export const CarCard = ({
  car,
  onCompare
}: {
  car: CarSpec;
  onCompare: () => void;
}) => (
  <div className="bg-white rounded-2xl shadow overflow-hidden relative">
    {car.score !== undefined && (
      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
        <Star size={14} /> {car.score}%
      </div>
    )}

    <CarImage car={car} />

    <div className="p-5 space-y-3">
      <h3 className="font-bold">{car.brand} {car.model}</h3>
      <p className="text-sm text-slate-500">{car.year}</p>

      <div className="text-sm space-y-1">
        <div className="flex justify-between"><Zap /> {car.hp} CV</div>
        <div className="flex justify-between"><Fuel /> {car.consumption} L</div>
        <div className="flex justify-between"><Gauge /> {car.weight} kg</div>
        <div className="flex justify-between"><Car /> {car.traction}</div>
      </div>

      <button
        onClick={onCompare}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold"
      >
        Comparar
      </button>
    </div>
  </div>
);
