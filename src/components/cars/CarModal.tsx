import { X } from 'lucide-react';
import { CarImage } from './CarImage';
import type { CarSpec } from '../../types/car';

interface CarModalProps {
  car: CarSpec;
  selectedColor: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CarModal = ({
  car,
  selectedColor,
  isOpen,
  onClose,
}: CarModalProps) => {
  if (!isOpen) return null;

  const brandLogoUrl = `https://www.google.com/s2/favicons?sz=128&domain=${car.brand.toLowerCase().replace(/\s+/g, '')}.com`;

  return (
    <div
      className="fixed inset-0 z-100 h-dvh w-screen flex flex-col items-center justify-center bg-[#121212] p-0 animate-in fade-in duration-300 overflow-hidden"
      onClick={onClose}
    >
      <div className="absolute top-6 left-6 z-120 flex items-center gap-3 animate-in slide-in-from-left-10 duration-700">
        <div className="w-10 h-10 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center p-2 md:p-3 shadow-xl">
          <img
            src={brandLogoUrl}
            alt={car.brand}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="block">
          <p className="text-white text-sm md:text-xl font-black uppercase italic leading-none">
            {car.brand}
          </p>
        </div>
      </div>

      <button
        className="absolute top-6 right-6 text-white/50 hover:text-white z-120 bg-white/5 rounded-full p-2"
        onClick={onClose}
      >
        <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1} />
      </button>

      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-center items-center px-4 transform scale-[1.5] md:scale-[2.5] lg:scale-[3.2] transition-transform duration-500">
          <CarImage
            car={car}
            selectedColor={selectedColor}
            showControls={false}
            isAutoRotating={false}
          />
        </div>

        <div className="absolute bottom-8 w-full flex flex-col items-center z-20 animate-in slide-in-from-bottom-10 duration-700">
          <h3 className="text-[#7a8170] text-4xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter italic leading-none text-center px-4 drop-shadow-2xl">
            {car.model}
          </h3>
        </div>
      </div>
    </div>
  );
};
