import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
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
  ChevronRight,
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
  onCompare: (color: string) => void;
  isSelected: boolean;
  lang?: 'es' | 'en';
}) => {
  const t = translations[lang];
  const [user] = useAuthState(auth);

  const [selectedColor, setSelectedColor] = useState(
    car.selectedColor || 'white'
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);

  const [prevCarId, setPrevCarId] = useState(car.id);
  if (car.id !== prevCarId) {
    setPrevCarId(car.id);
    setSelectedColor(car.selectedColor || 'white');
  }

  useEffect(() => {
    let isMounted = true;

    const checkFavoriteStatus = async () => {
      if (!user?.uid) {
        setIsFavorite(false);
        return;
      }
      try {
        const data = await favoriteService.getFavoriteDetail(user.uid, car.id);
        if (isMounted) {
          setIsFavorite(!!data);
          if (data?.selectedColor) setSelectedColor(data.selectedColor);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavoriteStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, car.id]);

  useEffect(() => {
    const syncColor = async () => {
      if (isFavorite && user?.uid) {
        try {
          await favoriteService.addFavorite(user.uid, car, selectedColor);
        } catch (error) {
          console.error('Error updating color in favorite:', error);
        }
      }
    };
    syncColor();
  }, [selectedColor, isFavorite, user?.uid, car]);

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
      console.error('Error managing favorite:', error);
    }
  };

  const getColorHex = (color: string) => {
    const colors: Record<string, string> = {
      white: '#F8FAFC',
      black: '#1A1A1A',
      silver: '#94A3B8',
      blue: '#2563EB',
      red: '#DC2626',
    };
    return colors[color] || '#F8FAFC';
  };

  const translateValue = (dict: Record<string, string>, value: string) => {
    if (!value) return value;
    const key = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    return dict[key] || value;
  };

  const stats = [
    {
      icon: <Zap size={12} />,
      label: t.hp,
      value: `${car.hp} ${lang === 'es' ? 'CV' : 'HP'}`,
    },
    {
      icon: <Fuel size={12} />,
      label: t.consumption,
      value: car.consumption === 0 ? 'Eco' : `${car.consumption} L`,
    },
    {
      icon: <Timer size={12} />,
      label: t.acceleration,
      value: `${car.acceleration}s`,
    },
    {
      icon: <Gauge size={12} />,
      label: t.topSpeed,
      value: `${car.topSpeed} km/h`,
    },
    {
      icon: <Droplets size={12} />,
      label: t.engine,
      value: translateValue(t.fuelTypes, car.fuelType),
    },
    {
      icon: <Settings2 size={12} />,
      label: t.transmission,
      value: translateValue(t.transmissions, car.transmission),
    },
    { icon: <Move size={12} />, label: t.traction, value: car.traction },
    { icon: <Weight size={12} />, label: t.weight, value: `${car.weight} kg` },
  ];

  return (
    <>
      <div
        className="car-card rounded-2xl overflow-hidden relative flex flex-col h-full transition-all duration-300 group"
        style={{
          transition:
            'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 z-30 p-2 rounded-full transition-all duration-200"
          style={{
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={17}
            className={
              isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
            }
            style={{ transition: 'all 0.2s' }}
          />
        </button>

        {/* Score badge */}
        {car.score !== undefined && (
          <div
            className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full text-[11px] font-black"
            style={{
              background: 'rgba(37,99,235,0.2)',
              border: '1px solid rgba(37,99,235,0.35)',
              color: '#93c5fd',
              backdropFilter: 'blur(8px)',
            }}
          >
            ★ {Math.round(car.score)}
          </div>
        )}

        {/* Car image — clickable */}
        <div
          data-testid="car-card-image"
          onMouseEnter={() => {
            // Only preload 360 angles if they hover the image specifically
            carService.angles.forEach((angle) => {
              const img = new Image();
              img.src = carService.getCarImage(
                car.brand,
                car.model,
                car.year,
                angle,
                'white',
                true
              );
            });
          }}
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer relative overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.9) 100%)',
          }}
        >
          <CarImage
            car={car}
            selectedColor={selectedColor}
            onAngleChange={setCurrentAngleIndex}
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'rgba(37,99,235,0.12)' }}
          >
            <span
              className="flex items-center gap-1.5 text-white font-bold text-xs px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(37,99,235,0.6)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Ver detalle <ChevronRight size={13} />
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1 gap-4">
          {/* Title + color swatches */}
          <div
            className="flex items-start justify-between gap-2"
            onMouseEnter={() =>
              carService.preloadColors(car.brand, car.model, car.year)
            }
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-0.5">
                {car.brand}
              </p>
              <h3 className="font-black text-lg leading-tight text-white">
                {car.model}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{car.year}</p>
            </div>
            <div className="flex gap-1.5 mt-1 flex-shrink-0">
              {carService.colorList.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: getColorHex(color),
                    border:
                      selectedColor === color
                        ? '2px solid #3b82f6'
                        : '2px solid rgba(255,255,255,0.15)',
                    transform:
                      selectedColor === color ? 'scale(1.25)' : 'scale(1)',
                    boxShadow:
                      selectedColor === color
                        ? '0 0 8px rgba(59,130,246,0.6)'
                        : 'none',
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Specs grid */}
          <div
            className="grid grid-cols-2 gap-x-3 gap-y-2"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 14,
              paddingBottom: 14,
            }}
          >
            {stats.map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center text-[11px] px-2 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-blue-500">{icon}</span>
                  {label}
                </span>
                <span className="font-bold text-slate-200 uppercase text-[11px]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Price + Compare button */}
          <div className="mt-auto space-y-2.5">
            {car.price > 0 ? (
              <p className="text-lg font-black text-white text-center">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(car.price)}
              </p>
            ) : (
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 text-center">
                <Info size={12} className="text-slate-600" />
                Precio no disponible
              </p>
            )}
            <button
              data-testid="compare-btn"
              onClick={() => onCompare(selectedColor)}
              disabled={isSelected}
              aria-disabled={isSelected}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                isSelected
                  ? 'cursor-not-allowed text-slate-500'
                  : 'text-white btn-glow'
              }`}
              style={
                isSelected
                  ? {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
                  : {}
              }
            >
              {isSelected ? `✓ ${t.inComparison}` : t.compareNow}
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
        initialAngleIndex={currentAngleIndex}
      />
    </>
  );
};
