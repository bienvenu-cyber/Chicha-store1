import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import ProductCard from './ProductCard';
import { fetchRecommendedProducts } from '../services/productService';

interface RecommendationSectionProps {
  currentProductId?: string;
  categoryId?: string;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ 
  currentProductId, 
  categoryId 
}) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const recommendations = await fetchRecommendedProducts(
          currentProductId, 
          categoryId
        );
        setRecommendedProducts(recommendations);
      } catch (error) {
        console.error('Failed to load recommendations', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentProductId || categoryId) {
      loadRecommendations();
    }
  }, [currentProductId, categoryId]);

  if (isLoading) {
    return (
      <div className="recommendations-loading">
        <p>Chargement des recommandations...</p>
      </div>
    );
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="recommendations-section">
      <h2>Produits Recommandés</h2>
      <div className="recommendations-grid">
        {recommendedProducts.map(product => (
          <ProductCard 
            key={product._id} 
            product={product} 
            variant="recommendation" 
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendationSection;
