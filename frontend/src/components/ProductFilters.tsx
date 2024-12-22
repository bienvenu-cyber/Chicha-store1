import React, { useState } from 'react';
import { FaFilter, FaSort } from 'react-icons/fa';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  onSortChange: (sortOption: string) => void;
  categories: string[];
  priceRanges: { min: number; max: number }[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  onFilterChange,
  onSortChange,
  categories,
  priceRanges
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterApply = () => {
    const filters: any = {};
    
    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      filters.priceRange = { min, max };
    }

    onFilterChange(filters);
    setIsFilterOpen(false);
  };

  const sortOptions = [
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'newest', label: 'Nouveautés' },
    { value: 'rating', label: 'Mieux notés' }
  ];

  return (
    <div className="product-filters">
      <div className="filter-controls">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="filter-toggle"
        >
          <FaFilter /> Filtres
        </button>

        <div className="sort-dropdown">
          <FaSort />
          <select 
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              onSortChange(e.target.value);
            }}
          >
            <option value="">Trier par</option>
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filter-modal">
          <div className="filter-section">
            <h3>Catégories</h3>
            {categories.map(category => (
              <label key={category}>
                <input
                  type="radio"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)}
                />
                {category}
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3>Prix</h3>
            {priceRanges.map(range => (
              <label key={`${range.min}-${range.max}`}>
                <input
                  type="radio"
                  value={`${range.min}-${range.max}`}
                  checked={selectedPriceRange === `${range.min}-${range.max}`}
                  onChange={() => setSelectedPriceRange(`${range.min}-${range.max}`)}
                />
                {range.min}€ - {range.max}€
              </label>
            ))}
          </div>

          <div className="filter-actions">
            <button onClick={handleFilterApply}>Appliquer</button>
            <button onClick={() => setIsFilterOpen(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
