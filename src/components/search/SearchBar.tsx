import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export const SearchBar = ({
  query,
  onQueryChange,
  onSearch,
  loading
}: SearchBarProps) => {
  return (
    <div className="flex gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Ej: BMW Serie 3, Audi A4..."
        className="flex-1 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className="bg-blue-600 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"
      >
        <Search size={20} />
        Buscar
      </button>
    </div>
  );
};
