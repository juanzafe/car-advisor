import { Car } from 'lucide-react';

interface HeaderProps {
  selectedCount: number;
}

export const Header = ({ selectedCount }: HeaderProps) => {
  return (
    <header className="bg-white border-b p-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
          <Car size={32} /> CarAdvisor.io
        </h1>
        <nav className="space-x-6 text-gray-600 font-medium">
          <button className="hover:text-blue-600">Buscador</button>
          <button className="hover:text-blue-600 font-bold">
            Comparador ({selectedCount})
          </button>
        </nav>
      </div>
    </header>
  );
};
