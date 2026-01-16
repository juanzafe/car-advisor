import { useEffect, useMemo, useRef, useReducer } from 'react';
import { RotateCw, Play, Pause, Palette } from 'lucide-react';
import { useCarRotation } from '../../hooks/useCarRotation';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';

type ImageState = {
  angleIndex: number;
  rotating: boolean;
  colorIndex: number;
};

const initialState: ImageState = {
  angleIndex: 0,
  rotating: false,
  colorIndex: 0,
};

type ImageAction =
  | { type: 'RESET' }
  | { type: 'SET_ANGLE_INDEX'; payload: number }
  | { type: 'SET_ROTATING'; payload: boolean }
  | { type: 'SET_COLOR_INDEX'; payload: number };

const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case 'RESET':
      return initialState;
    case 'SET_ANGLE_INDEX':
      return { ...state, angleIndex: action.payload };
    case 'SET_ROTATING':
      return { ...state, rotating: action.payload };
    case 'SET_COLOR_INDEX':
      return { ...state, colorIndex: action.payload };
    default:
      return state;
  }
};

export const CarImage = ({ car }: { car: CarSpec }) => {
  const [state, dispatch] = useReducer(imageReducer, initialState);
  const { angleIndex, rotating, colorIndex } = state;
  const prevCarIdRef = useRef(car.id);

  // Obtenemos el ID del color actual de la lista
  const currentColorId = carService.colorList[colorIndex];

  const currentImageUrl = useMemo(() => {
    return carService.getCarImage(
      car.brand,
      car.model,
      car.year,
      carService.angles[angleIndex],
      currentColorId
    );
  }, [car, angleIndex, currentColorId]);

  useCarRotation(
    car,
    rotating,
    angleIndex,
    (index: number | ((prev: number) => number)) => {
      const newIndex = typeof index === 'function' ? index(angleIndex) : index;
      dispatch({ type: 'SET_ANGLE_INDEX', payload: newIndex });
    }
  );

  useEffect(() => {
    if (prevCarIdRef.current !== car.id) {
      prevCarIdRef.current = car.id;
      dispatch({ type: 'RESET' });
    }
  }, [car.id]);

  const toggleNextColor = () => {
    dispatch({
      type: 'SET_COLOR_INDEX',
      payload: (colorIndex + 1) % carService.colorList.length,
    });
  };

  return (
    <div className="relative group bg-slate-50 h-48 flex items-center justify-center overflow-hidden rounded-t-xl">
      <img
        src={currentImageUrl}
        alt={car.model}
        key={`${car.id}-${currentColorId}-${angleIndex}`}
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

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* Botón único de paleta que rota colores */}
          <button
            onClick={toggleNextColor}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700 transition-colors"
            title="Siguiente color"
          >
            <Palette size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
