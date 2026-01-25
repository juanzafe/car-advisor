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
import { carService } from '../../services/carService';
import { favoriteService } from '../../services/favoriteService';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { translations } from '../../locales/translations';

export const CarCard = ({
  car,
  onCompare,
  isSelected,
  lang = 'es',
}: {
  car: CarSpec;
  onCompare: () => void;
  isSelected: boolean;
  lang?: 'es' | 'en';
}) => {
  const t = translations[lang];
  const [selectedColor, setSelectedColor] = useState(
    car.selectedColor || 'white'
  );
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
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    try {
      if (!newFavoriteStatus) {
        await favoriteService.removeFavorite(user?.uid, car.id);
      } else {
        await favoriteService.addFavorite(user?.uid, car, selectedColor);
      }
    } catch (error) {
      setIsFavorite(!newFavoriteStatus);
      console.error('Error al gestionar favorito:', error);
    }
  };

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

  // Función de ayuda para normalizar y traducir valores técnicos
  const translateValue = (dict: Record<string, string>, value: string) => {
    if (!value) return value;
    const key = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    return dict[key] || value;
  };

  return (
    <>
      <div
        onMouseEnter={() =>
          carService.preloadFullCar(car.brand, car.model, car.year)
        }
        className="bg-[#f1f5f9] rounded-2xl shadow-md overflow-hidden relative border border-slate-200 flex flex-col h-full transition-all hover:shadow-xl"
      >
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
                <Zap size={13} className="text-blue-600" /> {t.hp}
              </span>
              <span className="font-bold">{car.hp}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Fuel size={13} className="text-blue-600" /> {t.consumption}
              </span>
              <span className="font-bold">{car.consumption}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Timer size={13} className="text-blue-600" /> {t.acceleration}
              </span>
              <span className="font-bold">{car.acceleration}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Gauge size={13} className="text-blue-600" /> {t.topSpeed}
              </span>
              <span className="font-bold">{car.topSpeed}km/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Droplets size={13} className="text-blue-600" /> {t.engine}
              </span>
              <span className="font-bold uppercase">
                {translateValue(t.fuelTypes, car.fuelType)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Settings2 size={13} className="text-blue-600" />{' '}
                {t.transmission}
              </span>
              <span className="font-bold uppercase">
                {translateValue(t.transmissions, car.transmission)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Move size={13} className="text-blue-600" /> {t.traction}
              </span>
              <span className="font-bold uppercase">{car.traction}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Weight size={13} className="text-blue-600" /> {t.weight}
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
              {isSelected ? t.inComparison : t.compareNow}
            </button>
          </div>
        </div>
      </div>
      <CarModal
        car={car}
        selectedColor={selectedColor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lang={lang}
      />
    </>
  );
};
