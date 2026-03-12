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
  Tooltip,
} from 'recharts';
import type { CarSpec } from '../../types/car';
import { carService } from '../../services/carService';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#a855f7'];

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
  <div
    className="flex justify-between items-center text-sm py-2.5 px-3 rounded-lg"
    style={{
      background: '#f8fafc',
      border: '1px solid rgba(0,0,0,0.08)',
      marginBottom: 4,
    }}
  >
    <span className="flex items-center gap-2 text-slate-700">
      <span className="text-blue-400">{icon}</span> {label}
    </span>
    <span className="font-bold text-slate-900">
      {value || '---'}
      {unit}
    </span>
  </div>
);

export const ComparisonCard = ({
  car,
  onRemove,
}: {
  car: CarSpec;
  onRemove: (id: string) => void;
}) => {
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
      : null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-video flex items-center justify-center p-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(241,245,249,0.8), rgba(226,232,240,0.6))',
        }}
      >
        <img
          src={carImageUrl}
          alt={car.model}
          className="w-full h-full object-contain"
        />
        <button
          onClick={() => onRemove(car.id)}
          className="absolute top-2 right-2 p-1.5 rounded-full text-white transition-all hover:scale-110"
          style={{
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <X size={16} strokeWidth={2.5} className="text-red-400" />
        </button>

        {car.selectedColor && (
          <div
            className="absolute bottom-2 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase text-slate-900"
            style={{
              background: 'rgba(241,245,249,0.8)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-white/20"
              style={{
                backgroundColor:
                  car.selectedColor === 'white' ? '#F8FAFC' : car.selectedColor,
              }}
            />
            {car.selectedColor}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col grow">
        <div className="mb-4">
          <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">
            {car.brand}
          </p>
          <h3 className="text-2xl font-black text-slate-900 leading-tight">
            {car.model}
          </h3>
        </div>

        <div className="grow space-y-1">
          <SpecRow
            icon={<Zap size={14} />}
            label="Potencia"
            value={car.hp}
            unit=" CV"
          />
          <SpecRow
            icon={<Droplets size={14} />}
            label="Consumo"
            value={car.consumption === 0 ? 'Eco' : car.consumption}
            unit={car.consumption === 0 ? '' : ' L/100'}
          />
          <SpecRow
            icon={<Gauge size={14} />}
            label="Peso"
            value={car.weight}
            unit=" kg"
          />
          <SpecRow icon={<Calendar size={14} />} label="Año" value={car.year} />
          <SpecRow
            icon={<Star size={14} />}
            label="Sport Score"
            value={car.sportScore}
            unit=" pts"
          />
        </div>

        <div
          className="mt-5 pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
        >
          {formattedPrice ? (
            <span className="text-2xl font-black text-slate-900">
              {formattedPrice}
            </span>
          ) : (
            <span className="text-xs text-slate-500 italic">
              Precio no disponible
            </span>
          )}
          <Wallet className="text-slate-600" size={20} />
        </div>
      </div>
    </div>
  );
};

const WinnerCard = ({
  icon,
  label,
  car,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  car: CarSpec;
  gradient: string;
}) => (
  <div
    className="rounded-2xl p-4 flex items-center gap-3 flex-1"
    style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div
      className="p-2.5 rounded-xl flex-shrink-0"
      style={{
        background: gradient,
        boxShadow: `0 4px 12px ${gradient.split(',')[0].replace('linear-gradient(135deg,', '').trim()}44`,
      }}
    >
      <span className="text-white">{icon}</span>
    </div>
    <div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-0.5">
        {label}
      </span>
      <span className="text-sm font-black text-slate-900 leading-tight">
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
    <section
      className="rounded-3xl space-y-8 p-4 md:p-8"
      style={{
        background: '#f8fafc',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Winner badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <WinnerCard
          icon={<Trophy size={18} />}
          label="El mejor"
          car={winners.overall}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
        />
        <WinnerCard
          icon={<Leaf size={18} />}
          label="Eficiencia"
          car={winners.eco}
          gradient="linear-gradient(135deg, #22c55e, #16a34a)"
        />
        <WinnerCard
          icon={<Zap size={18} />}
          label="Deportivo"
          car={winners.sport}
          gradient="linear-gradient(135deg, #ef4444, #dc2626)"
        />
        <WinnerCard
          icon={<Users size={18} />}
          label="Familiar"
          car={winners.family}
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
      </div>

      {/* Radar chart */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          height: 320,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={buildRadarData(cars)}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#334155', fontSize: 13, fontWeight: 900 }}
            />
            <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 12,
                color: '#1e293b',
                fontSize: 12,
              }}
            />
            {cars.map((car, index) => (
              <Radar
                key={car.id}
                name={`${car.brand} ${car.model}`}
                dataKey={car.id}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2.5}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Car cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
