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
      // Usamos h-screen y w-screen para asegurar que cubra TODO
      className="fixed inset-0 z-100 h-screen w-screen flex items-center justify-center bg-[#121212] p-0 animate-in fade-in duration-300 overflow-hidden"
      onClick={onClose}
    >
      {/* 1. LOGO EN LA ESQUINA SUPERIOR IZQUIERDA */}
      <div className="absolute top-8 left-8 z-120 flex items-center gap-4 animate-in slide-in-from-left-10 duration-700">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center p-3 shadow-xl border border-white/10">
          <img
            src={brandLogoUrl}
            alt={car.brand}
            className="w-full h-full object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
        <div className="hidden md:block">
          <p className="text-white text-xl font-black uppercase italic">
            {car.brand}
          </p>
        </div>
      </div>

      {/* Botón Cerrar */}
      <button
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors cursor-pointer z-120 hover:scale-110 bg-white/5 rounded-full p-2"
        onClick={onClose}
      >
        <X size={30} strokeWidth={1} />
      </button>

      <div
        className="relative w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CONTENEDOR DE LA IMAGEN GIGANTE */}
        <div className="relative z-10 w-full flex justify-center items-center px-4 animate-in zoom-in-75 duration-500 ease-out">
          <div className="w-full max-w-[90vw] transform scale-[1.5] md:scale-[2.2] lg:scale-[3.2]">
            <CarImage
              car={car}
              selectedColor={selectedColor}
              showControls={false}
              isAutoRotating={false}
            />
          </div>
        </div>

        {/* INFO INFERIOR */}
        <div className="absolute bottom-12 flex flex-col items-center gap-4 z-20 animate-in slide-in-from-bottom-10 duration-700">
          <h3 className="text-[#7a8170] text-5xl md:text-9xl font-black uppercase tracking-tighter italic leading-none">
            {car.model}
          </h3>
        </div>
      </div>
    </div>
  );
};
