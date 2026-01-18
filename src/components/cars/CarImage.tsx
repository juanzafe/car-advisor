import { useEffect, useMemo, useRef, useReducer } from 'react';
import { RotateCw, Play, Pause } from 'lucide-react'; // Quitamos Palette si no la vamos a usar
import { useCarRotation } from '../../hooks/useCarRotation';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';

type ImageState = {
  angleIndex: number;
  rotating: boolean;
};

const initialState: ImageState = {
  angleIndex: 0,
  rotating: false,
};

type ImageAction =
  | { type: 'RESET' }
  | { type: 'SET_ANGLE_INDEX'; payload: number }
  | { type: 'SET_ROTATING'; payload: boolean };

const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case 'RESET':
      return initialState;
    case 'SET_ANGLE_INDEX':
      return { ...state, angleIndex: action.payload };
    case 'SET_ROTATING':
      return { ...state, rotating: action.payload };
    default:
      return state;
  }
};

export const CarImage = ({
  car,
  selectedColor,
}: {
  car: CarSpec;
  selectedColor: string;
}) => {
  const [state, dispatch] = useReducer(imageReducer, initialState);
  const { angleIndex, rotating } = state;
  const prevCarIdRef = useRef(car.id);

  // AHORA USAMOS selectedColor que viene del padre
  const currentImageUrl = useMemo(() => {
    return carService.getCarImage(
      car.brand,
      car.model,
      car.year,
      carService.angles[angleIndex],
      selectedColor
    );
  }, [car, angleIndex, selectedColor]);

  useCarRotation(
    car,
    rotating,
    (index: number | ((prev: number) => number)) => {
      const newIndex = typeof index === 'function' ? index(angleIndex) : index;
      dispatch({ type: 'SET_ANGLE_INDEX', payload: newIndex });
    },
    selectedColor // Pasamos el color al hook para la precarga
  );

  useEffect(() => {
    if (prevCarIdRef.current !== car.id) {
      prevCarIdRef.current = car.id;
      dispatch({ type: 'RESET' });
    }
  }, [car.id]);

  return (
    <div className="relative group bg-slate-50 h-48 flex items-center justify-center overflow-hidden rounded-t-xl">
      <img
        src={currentImageUrl}
        alt={car.model}
        // El key ahora depende de selectedColor para que React sepa que debe refrescar la imagen
        key={`${car.id}-${selectedColor}-${angleIndex}`}
        className="h-40 w-full object-contain p-2 relative z-0 transition-opacity duration-200"
      />

      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-slate-200">
          <button
            onClick={() =>
              dispatch({
                type: 'SET_ANGLE_INDEX',
                payload:
                  (angleIndex - 1 + carService.angles.length) %
                  carService.angles.length,
              })
            }
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700"
          >
            <RotateCw size={18} className="rotate-180" />
          </button>

          <button
            onClick={() =>
              dispatch({ type: 'SET_ROTATING', payload: !rotating })
            }
            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md"
          >
            {rotating ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>

          <button
            onClick={() =>
              dispatch({
                type: 'SET_ANGLE_INDEX',
                payload: (angleIndex + 1) % carService.angles.length,
              })
            }
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700"
          >
            <RotateCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
