import { useState } from 'react';
import { Zap, Fuel, Gauge, Car, Star, Heart } from 'lucide-react';
import { CarImage } from './CarImage';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';

export const CarCard = ({
  car,
  onCompare,
  isSelected,
}: {
  car: CarSpec;
  onCompare: () => void;
  isSelected: boolean;
}) => {
  const [selectedColor, setSelectedColor] = useState('white');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleFavoriteClick = async () => {
    setLoadingFav(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        setIsFavorite(false);
      } else {
        // Add to favorites
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden relative border border-slate-100 group">
      {car.score !== undefined && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
          <Star size={14} fill="currentColor" />
          <span>{car.score}%</span>
        </div>
      )}
      <button
        onClick={handleFavoriteClick}
        disabled={loadingFav}
        className="absolute top-3 left-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-90"
        title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <Heart
          size={20}
          className={`transition-colors ${
            isFavorite
              ? 'fill-red-500 text-red-500'
              : 'text-slate-400 hover:text-red-500'
          } ${loadingFav ? 'animate-pulse' : ''}`}
        />
      </button>

      <CarImage car={car} selectedColor={selectedColor} />

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight uppercase">
              {car.brand} {car.model}
            </h3>
            <p className="text-sm text-slate-500">{car.year}</p>
          </div>

          <div className="flex gap-1.5 mt-1">
            {carService.colorList.map((colorName) => (
              <button
                key={colorName}
                onClick={() => setSelectedColor(colorName)}
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 ${
                  selectedColor === colorName
                    ? 'border-blue-500 scale-110 shadow-sm'
                    : 'border-slate-200'
                }`}
                style={{ backgroundColor: getColorHex(colorName) }}
                title={`Cambiar a color ${colorName}`}
              />
            ))}
          </div>
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
            <span className="font-semibold text-slate-900">
              {car.weight} kg
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-2">
              <Car size={16} className="text-blue-500" /> Tracción
            </span>
            <span className="font-semibold text-slate-900 uppercase">
              {car.traction}
            </span>
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
};

function getColorHex(colorName: string) {
  const colors: Record<string, string> = {
    white: '#FFFFFF',
    black: '#1A1A1A',
    silver: '#E5E5E5',
    blue: '#2563EB',
    red: '#DC2626',
  };
  return colors[colorName] || '#CBD5E1';
}
