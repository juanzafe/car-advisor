import { X, Trophy, Leaf, Zap, Users } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { CarSpec } from '../../types/car';

/* ============================
   Colores fijos para coches
============================ */
const COLORS = [
  '#2563eb', // azul
  '#16a34a', // verde
  '#dc2626', // rojo
  '#7c3aed', // morado
];

/* ============================
   Helper local de comparación
============================ */
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
    <section className="bg-blue-50 p-6 rounded-2xl space-y-8">
      <h2 className="text-xl font-bold">Comparativa y recomendación</h2>

      {/* ===== CONCLUSIÓN ===== */}
      <div className="grid md:grid-cols-4 gap-4">
        <WinnerCard
          icon={<Trophy />}
          label="Mejor opción"
          car={winners.overall}
        />
        <WinnerCard icon={<Leaf />} label="Más eficiente" car={winners.eco} />
        <WinnerCard icon={<Zap />} label="Más deportivo" car={winners.sport} />
        <WinnerCard
          icon={<Users />}
          label="Mejor familiar"
          car={winners.family}
        />
      </div>

      {/* ===== RADAR + LEYENDA ===== */}
      <div className="bg-white rounded-xl p-6 shadow-sm grid md:grid-cols-4 gap-6">
        {/* Radar */}
        <div className="md:col-span-3 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={buildRadarData(cars)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 100]} />
              {cars.map((car, index) => (
                <Radar
                  key={car.id}
                  name={`${car.brand} ${car.model}`}
                  dataKey={car.id}
                  stroke={COLORS[index]}
                  fill={COLORS[index]}
                  fillOpacity={0.25}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Modelos</h4>
          {cars.map((car, index) => (
            <div key={car.id} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span>
                {car.brand} {car.model}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TARJETAS DE COCHES ===== */}
      <div className="grid md:grid-cols-3 gap-6">
        {cars.map((c) => (
          <div
            key={c.id}
            className="bg-white p-4 rounded-xl relative shadow-sm"
          >
            <button
              onClick={() => onRemove(c.id)}
              className="absolute top-2 right-2 text-red-500 hover:scale-110 transition"
            >
              <X />
            </button>

            <h3 className="font-bold">
              {c.brand} {c.model}
            </h3>

            <p className="text-sm text-gray-600">
              {c.hp} CV · {c.consumption} L · {c.price.toLocaleString()} €
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ============================
   Radar helpers
============================ */
function buildRadarData(cars: CarSpec[]) {
  return [
    {
      metric: 'Eco',
      ...Object.fromEntries(cars.map((c) => [c.id, Math.round(c.ecoScore)])),
    },
    {
      metric: 'Sport',
      ...Object.fromEntries(cars.map((c) => [c.id, Math.round(c.sportScore)])),
    },
    {
      metric: 'Family',
      ...Object.fromEntries(cars.map((c) => [c.id, Math.round(c.familyScore)])),
    },
  ];
}

/* ============================
   UI Components
============================ */
const WinnerCard = ({
  icon,
  label,
  car,
}: {
  icon: React.ReactNode;
  label: string;
  car: CarSpec;
}) => (
  <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
    <div className="text-blue-600">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-sm">
        {car.brand} {car.model}
      </p>
    </div>
  </div>
);
