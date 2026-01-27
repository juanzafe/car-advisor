import React from 'react';
import {
  Trophy,
  Leaf,
  Zap,
  Users,
  X,
  Gauge,
  Calendar,
  Droplets,
  Wallet,
  Star,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { CarSpec } from '../../types/car';
import { carService } from '../../services/carService';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#7c3aed'];

/**
 * COMPONENTE DE FILA TÉCNICA
 */
const SpecRow = ({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
    <span className="flex items-center gap-2 text-slate-500">
      <span className="text-blue-500">{icon}</span> {label}
    </span>
    <span className="font-bold text-slate-700">
      {value || '---'}
      {unit}
    </span>
  </div>
);

/**
 * TARJETA DE COMPARACIÓN
 */
export const ComparisonCard = ({
  car,
  onRemove,
}: {
  car: CarSpec;
  onRemove: (id: string) => void;
}) => {
  // Generamos la URL de la imagen usando el color seleccionado o blanco por defecto
  const carImageUrl = carService.getCarImage(
    car.brand,
    car.model,
    car.year,
    '01',
    car.selectedColor || 'white'
  );

  const formattedPrice =
    car.price > 0
      ? new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(car.price)
      : 'Consultar';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
      <div className="relative aspect-video bg-slate-100 flex items-center justify-center p-4">
        <img
          src={carImageUrl}
          alt={car.model}
          className="w-full h-full object-contain"
        />
        <button
          onClick={() => onRemove(car.id)}
          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* Indicador visual del color seleccionado */}
        {car.selectedColor && (
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-200 shadow-sm">
            <div
              className="w-3 h-3 rounded-full border border-slate-300"
              style={{
                backgroundColor:
                  car.selectedColor === 'white' ? '#FFFFFF' : car.selectedColor,
              }}
            />
            <span className="text-[10px] font-bold uppercase text-slate-500">
              {car.selectedColor}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col grow">
        <div className="mb-4">
          <p className="text-blue-600 font-black text-xs uppercase tracking-tighter mb-1">
            {car.brand}
          </p>
          <h3 className="text-2xl font-black text-slate-900 leading-tight">
            {car.model}
          </h3>
        </div>

        <div className="space-y-1 grow">
          <SpecRow
            icon={<Zap size={16} />}
            label="Potencia"
            value={car.hp}
            unit=" CV"
          />
          <SpecRow
            icon={<Droplets size={16} />}
            label="Consumo"
            value={car.consumption === 0 ? 'Eco' : car.consumption}
            unit={car.consumption === 0 ? '' : ' L/100'}
          />
          <SpecRow
            icon={<Gauge size={16} />}
            label="Peso"
            value={car.weight}
            unit=" kg"
          />
          <SpecRow icon={<Calendar size={16} />} label="Año" value={car.year} />
          <SpecRow
            icon={<Star size={16} />}
            label="Sport Score"
            value={car.sportScore}
            unit=" pts"
          />
        </div>

        <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
          <span className="text-2xl font-black text-slate-900">
            {formattedPrice}
          </span>
          <Wallet className="text-slate-300" size={24} />
        </div>
      </div>
    </div>
  );
};

/**
 * GANADORES
 */
const WinnerCard = ({
  icon,
  label,
  car,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  car: CarSpec;
  colorClass: string;
}) => (
  <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md border border-slate-100 flex-1">
    <div className={`${colorClass} p-3 rounded-xl text-white shadow-sm`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
        {label}
      </span>
      <span className="text-sm font-black text-slate-800 leading-none">
        {car.brand} {car.model}
      </span>
    </div>
  </div>
);

export const ComparisonGrid = ({
  cars,
  onRemove,
}: {
  cars: CarSpec[];
  onRemove: (id: string) => void;
}) => {
  if (!cars.length) return null;
  const winners = getComparisonWinners(cars);

  return (
    <section className="bg-slate-100/50 p-4 md:p-8 rounded-4xl space-y-8 border border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WinnerCard
          icon={<Trophy size={20} />}
          label="El mejor"
          car={winners.overall}
          colorClass="bg-amber-500"
        />
        <WinnerCard
          icon={<Leaf size={20} />}
          label="Eficiencia"
          car={winners.eco}
          colorClass="bg-green-500"
        />
        <WinnerCard
          icon={<Zap size={20} />}
          label="Deportivo"
          car={winners.sport}
          colorClass="bg-red-500"
        />
        <WinnerCard
          icon={<Users size={20} />}
          label="Familiar"
          car={winners.family}
          colorClass="bg-blue-600"
        />
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 h-100">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={buildRadarData(cars)}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#475569', fontSize: 14, fontWeight: '900' }}
            />
            <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
            {cars.map((car, index) => (
              <Radar
                key={car.id}
                name={car.model}
                dataKey={car.id}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.3}
                strokeWidth={3}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => (
          <ComparisonCard key={car.id} car={car} onRemove={onRemove} />
        ))}
      </div>
    </section>
  );
};

function getComparisonWinners(cars: CarSpec[]) {
  return {
    overall: [...cars].sort(
      (a, b) =>
        b.ecoScore +
        b.sportScore +
        b.familyScore -
        (a.ecoScore + a.sportScore + a.familyScore)
    )[0],
    eco: [...cars].sort((a, b) => b.ecoScore - a.ecoScore)[0],
    sport: [...cars].sort((a, b) => b.sportScore - a.sportScore)[0],
    family: [...cars].sort((a, b) => b.familyScore - a.familyScore)[0],
  };
}

function buildRadarData(cars: CarSpec[]) {
  return [
    {
      metric: 'ECO',
      ...Object.fromEntries(cars.map((c) => [c.id, Math.round(c.ecoScore)])),
    },
    {
      metric: 'SPORT',
      ...Object.fromEntries(cars.map((c) => [c.id, Math.round(c.sportScore)])),
    },
    {
      metric: 'FAMILY',
      ...Object.fromEntries(cars.map((c) => [c.id, Math.round(c.familyScore)])),
    },
  ];
}
