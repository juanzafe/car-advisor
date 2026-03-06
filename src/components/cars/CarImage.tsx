import { useMemo, useReducer, useState, useEffect } from 'react';
import { RotateCw, Play, Pause } from 'lucide-react';
import { useCarRotation } from '../../hooks/useCarRotation';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';

type ImageState = { angleIndex: number; rotating: boolean };
type ImageAction =
  | { type: 'RESET' }
  | { type: 'SET_ANGLE_INDEX'; payload: number }
  | { type: 'SET_ROTATING'; payload: boolean };

const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case 'RESET':
      return { ...state, angleIndex: 0, rotating: false };
    case 'SET_ANGLE_INDEX':
      return { ...state, angleIndex: action.payload };
    case 'SET_ROTATING':
      return { ...state, rotating: action.payload };
    default:
      return state;
  }
};

interface CarImageProps {
  car: CarSpec;
  selectedColor: string;
  showControls?: boolean;
  isAutoRotating?: boolean;
  interactive?: boolean;
  isFull?: boolean;
  initialAngleIndex?: number;
  onAngleChange?: (index: number) => void;
}

export const CarImage = ({
  car,
  selectedColor,
  showControls = true,
  isAutoRotating = false,
  interactive = true,
  isFull = false,
  initialAngleIndex = 0,
  onAngleChange,
}: CarImageProps) => {
  const [state, dispatch] = useReducer(imageReducer, {
    angleIndex: initialAngleIndex,
    rotating: isAutoRotating,
  });
  const { angleIndex, rotating } = state;

  useEffect(() => {
    onAngleChange?.(angleIndex);
  }, [angleIndex, onAngleChange]);

  const currentTargetUrl = useMemo(() => {
    return carService.getCarImage(
      car.brand,
      car.model,
      car.year,
      carService.angles[angleIndex],
      selectedColor,
      isFull
    );
  }, [car, angleIndex, selectedColor, isFull]);

  // Double buffering to prevent white flashes
  const [displayedUrl, setDisplayedUrl] = useState(currentTargetUrl);
  // We keep track of the url we are currently loading to avoid triggering twice
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  // Derive loading state during render to avoid cascading updates in effect
  const isLoaded = displayedUrl === currentTargetUrl && loadingUrl === null;

  if (currentTargetUrl !== displayedUrl && currentTargetUrl !== loadingUrl) {
    setLoadingUrl(currentTargetUrl);
  }

  useEffect(() => {
    if (!loadingUrl) return;

    let isMounted = true;
    const img = new Image();
    img.src = loadingUrl;
    img.onload = () => {
      if (isMounted) {
        setDisplayedUrl(loadingUrl);
        setLoadingUrl(null);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [loadingUrl]);

  useCarRotation(
    car,
    rotating,
    (index: number | ((prev: number) => number)) => {
      const newIndex = typeof index === 'function' ? index(angleIndex) : index;
      dispatch({ type: 'SET_ANGLE_INDEX', payload: newIndex });
    },
    selectedColor
  );

  const handleImageClick = () => {
    if (!interactive) return;
    dispatch({
      type: 'SET_ANGLE_INDEX',
      payload: (angleIndex + 1) % carService.angles.length,
    });
  };

  return (
    <div
      className={`relative h-56 w-full flex items-center justify-center bg-transparent overflow-visible ${
        interactive ? 'cursor-pointer' : 'pointer-events-none'
      }`}
      onClick={handleImageClick}
    >
      <div className="relative w-full h-44 flex items-center justify-center">
        {/* The current visible image */}
        <img
          src={displayedUrl}
          alt={car.model}
          className={`h-full w-full object-contain absolute inset-0 z-10 pointer-events-none transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-80'
          }`}
        />

        {/* Loading indicator (optional, very subtle) */}
        {!isLoaded && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {showControls && interactive && (
        <div className="absolute bottom-0 inset-x-0 flex justify-center z-40 pb-2">
          <div
            className="flex items-center gap-6 bg-white/10 backdrop-blur-md shadow-xl p-3 rounded-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: 'SET_ANGLE_INDEX',
                  payload:
                    (angleIndex - 1 + carService.angles.length) %
                    carService.angles.length,
                });
              }}
              className="text-white p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
            >
              <RotateCw size={24} className="rotate-180" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'SET_ROTATING', payload: !rotating });
              }}
              className="bg-blue-600 text-white rounded-full p-2.5 shadow-lg shadow-blue-500/30 hover:bg-blue-500 active:scale-90 transition-all"
            >
              {rotating ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: 'SET_ANGLE_INDEX',
                  payload: (angleIndex + 1) % carService.angles.length,
                });
              }}
              className="text-white p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
            >
              <RotateCw size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
