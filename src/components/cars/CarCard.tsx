import { useEffect, useState } from 'react';
import {
  Zap,
  Fuel,
  Heart,
  Timer,
  Gauge,
  Weight,
  Move,
  Settings2,
  Droplets,
} from 'lucide-react';
import { CarImage } from './CarImage';
import { CarModal } from './CarModal';
import type { CarSpec } from '../../types/car';
import { carService } from '../../services/carService'; // Importamos el servicio para los colores
import { favoriteService } from '../../services/favoriteService';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const CarCard = ({
  car,
  onCompare,
  isSelected,
}: {
  car: CarSpec;
  onCompare: () => void;
  isSelected: boolean;
}) => {
  // CORRECCIÓN 1: Necesitamos el setter para cambiar el color
  const [selectedColor, setSelectedColor] = useState('white');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const check = async () => {
      const data = await favoriteService.getFavoriteDetail(user?.uid, car.id);
      if (data) setIsFavorite(true);
    };
    check();
  }, [user?.uid, car.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    try {
      if (isFavorite) await favoriteService.removeFavorite(user?.uid, car.id);
      else await favoriteService.addFavorite(user?.uid, car, selectedColor);
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  // Función auxiliar para los círculos de color
  const getColorHex = (color: string) => {
    const colors: Record<string, string> = {
      white: '#FFFFFF',
      black: '#1A1A1A',
      silver: '#E5E5E5',
      blue: '#2563EB',
      red: '#DC2626',
    };
    return colors[color] || '#FFFFFF';
  };

  return (
    <>
      <div className="bg-[#f1f5f9] rounded-2xl shadow-md overflow-hidden relative border border-slate-200 flex flex-col h-full transition-all hover:shadow-xl">
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
        >
          <Heart
            size={20}
            className={
              isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
            }
          />
        </button>

        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <CarImage car={car} selectedColor={selectedColor} />
        </div>

        <div className="p-5 flex flex-col flex-1 gap-4">
          <div>
            <h3 className="font-bold text-lg leading-tight uppercase text-slate-800 mb-3">
              {car.brand} {car.model}
            </h3>

            {/* CORRECCIÓN 2: Selector de colores implementado */}
            <div className="flex gap-2">
              {carService.colorList.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-blue-600 scale-110 shadow-sm'
                      : 'border-white'
                  }`}
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px] border-y border-slate-200/50 py-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Zap size={13} className="text-blue-600" /> CV
              </span>
              <span className="font-bold">{car.hp}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Fuel size={13} className="text-blue-600" /> L/100
              </span>
              <span className="font-bold">{car.consumption}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Timer size={13} className="text-blue-600" /> 0-100
              </span>
              <span className="font-bold">{car.acceleration}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Gauge size={13} className="text-blue-600" /> V. Máx
              </span>
              <span className="font-bold">{car.topSpeed}km/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Droplets size={13} className="text-blue-600" /> Motor
              </span>
              <span className="font-bold">{car.fuelType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Settings2 size={13} className="text-blue-600" /> Cambio
              </span>
              <span className="font-bold">{car.transmission}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Move size={13} className="text-blue-600" /> Trac.
              </span>
              <span className="font-bold">{car.traction}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Weight size={13} className="text-blue-600" /> Peso
              </span>
              <span className="font-bold">{car.weight}kg</span>
            </div>
          </div>

          <div className="mt-auto pt-2">
            <button
              onClick={onCompare}
              disabled={isSelected}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                isSelected
                  ? 'bg-slate-200 text-slate-400'
                  : 'bg-blue-600 text-white active:scale-95 shadow-md shadow-blue-200'
              }`}
            >
              {isSelected ? 'En comparativa' : 'Comparar ahora'}
            </button>
          </div>
        </div>
      </div>
      <CarModal
        car={car}
        selectedColor={selectedColor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
