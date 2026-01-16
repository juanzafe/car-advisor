import { Car } from 'lucide-react';

export const Header = ({ selectedCount }: { selectedCount: number }) => (
  <header className="bg-white border-b sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <Car className="text-blue-600" />
        CarAdvisor Pro TE AMO
      </h1>
      <div className="font-semibold text-blue-600">
        Comparando: {selectedCount}
      </div>
    </div>
  </header>
);
