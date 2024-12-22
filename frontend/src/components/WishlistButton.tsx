import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { 
  addToWishlist, 
  removeFromWishlist, 
  checkInWishlist 
} from '../services/wishlistService';
import { Product } from '../types/Product';

interface WishlistButtonProps {
  product: Product;
  size?: 'small' | 'medium' | 'large';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  product, 
  size = 'medium' 
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkWishlist = async () => {
      if (user) {
        const inList = await checkInWishlist(user._id, product._id);
        setIsInWishlist(inList);
      }
    };

    checkWishlist();
  }, [user, product._id]);

  const toggleWishlist = async () => {
    if (!user) {
      alert('Connectez-vous pour ajouter à la wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(user._id, product._id);
      } else {
        await addToWishlist(user._id, product._id);
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Erreur de la wishlist', error);
    }
  };

  const sizeClasses = {
    small: 'wishlist-btn-small',
    medium: 'wishlist-btn-medium',
    large: 'wishlist-btn-large'
  };

  return (
    <button 
      className={`wishlist-btn ${sizeClasses[size]} ${isInWishlist ? 'in-wishlist' : ''}`}
      onClick={toggleWishlist}
      aria-label={isInWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
    >
      {isInWishlist ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default WishlistButton;
