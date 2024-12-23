import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductDetails } from '../services/productService';
import { Product } from '../types/Product';
import WishlistButton from '../components/WishlistButton';
import ReviewSection from '../components/ReviewSection';
import RecommendationSection from '../components/RecommendationSection';
import '../styles/components.css';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const fetchedProduct = await fetchProductDetails(productId);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Failed to fetch product', error);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    // Logique d'ajout au panier
  };

  if (!product) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="product-header">
        <h1>{product.name}</h1>
        <WishlistButton product={product} size="large" />
      </div>

      <div className="product-content">
        <div className="product-image">
          <img src={product.imageUrl} alt={product.name} />
        </div>

        <div className="product-info">
          <p className="product-description">{product.description}</p>
          <div className="product-price">
            {product.price}€
          </div>

          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>

          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      <ReviewSection productId={productId} />

      <RecommendationSection 
        currentProductId={productId} 
        categoryId={product.category} 
      />
    </div>
  );
};

export default ProductDetailPage;
