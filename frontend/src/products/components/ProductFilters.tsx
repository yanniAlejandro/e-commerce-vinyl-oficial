import type { Category } from '../../shared/types';

interface ProductFiltersProps {
  search: string;
  genre: string;
  category: string;
  genres: string[];
  categories: Category[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function ProductFilters({
  search,
  genre,
  category,
  genres,
  categories,
  onSearchChange,
  onGenreChange,
  onCategoryChange,
}: ProductFiltersProps) {
  return (
    <aside className="filters" aria-label="Filtros del catálogo">
      <div className="filters__group">
        <label htmlFor="search">Buscar</label>
        <input
          id="search"
          type="search"
          placeholder="Artista o álbum..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filters__group">
        <label htmlFor="genre">Género</label>
        <select id="genre" value={genre} onChange={(e) => onGenreChange(e.target.value)}>
          <option value="">Todos</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="filters__group">
        <label htmlFor="category">Categoría</label>
        <select id="category" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
