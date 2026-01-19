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

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Botón Cerrar */}
      <button
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors cursor-pointer z-120 hover:scale-110 bg-white/5 rounded-full p-2"
        onClick={onClose}
      >
        <X size={30} strokeWidth={1} />
      </button>

      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CONTENEDOR DE LA IMAGEN GIGANTE */}
        <div className="relative z-10 w-full flex justify-center items-center px-4 animate-in zoom-in-75 duration-500 ease-out">
          <div className="w-full max-w-[90vw] transform scale-[1.5] md:scale-[2.2] lg:scale-[2.8]">
            <CarImage
              car={car}
              selectedColor={selectedColor}
              showControls={false}
              isAutoRotating={false} // El coche empieza a girar solo en el modal
            />
          </div>
        </div>

        {/* Info inferior con estilo deportivo */}
        <div className="absolute bottom-12 text-center z-20 animate-in slide-in-from-bottom-10 duration-700">
          <h3 className="text-[#7a8170] text-5xl md:text-9xl font-black uppercase tracking-tighter italic leading-none">
            {car.model}
          </h3>
        </div>
      </div>
    </div>
  );
};
