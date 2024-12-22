import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import ProductFilters from '../components/ProductFilters';
import WishlistButton from '../components/WishlistButton';
import { fetchProducts } from '../services/productService';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'Chichas', 
    'Accessoires', 
    'Tabacs', 
    'Charbons', 
    'Liquides'
  ];

  const priceRanges = [
    { min: 0, max: 50 },
    { min: 50, max: 100 },
    { min: 100, max: 200 },
    { min: 200, max: 500 }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Erreur de chargement des produits', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleFilterChange = (filters: any) => {
    let result = [...products];

    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.priceRange) {
      result = result.filter(p => 
        p.price >= filters.priceRange.min && 
        p.price <= filters.priceRange.max
      );
    }

    setFilteredProducts(result);
  };

  const handleSortChange = (sortOption: string) => {
    let sorted = [...filteredProducts];

    switch (sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'rating':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
    }

    setFilteredProducts(sorted);
  };

  if (loading) {
    return <div>Chargement des produits...</div>;
  }

  return (
    <div className="product-list-page">
      <h1>Notre Catalogue</h1>

      <ProductFilters 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        categories={categories}
        priceRanges={priceRanges}
      />

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price}€</p>
            <div className="product-actions">
              <button>Voir détails</button>
              <WishlistButton product={product} />
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          Aucun produit ne correspond à vos filtres.
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
