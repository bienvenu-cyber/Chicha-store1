import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import { Review } from '../types/Review';
import { fetchProductReviews, submitReview } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const fetchedReviews = await fetchProductReviews(productId);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Failed to load reviews', error);
      }
    };

    loadReviews();
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Vous devez être connecté pour laisser un avis');
      return;
    }

    try {
      const reviewData = {
        productId,
        userId: user._id,
        text: newReview,
        rating
      };

      const submittedReview = await submitReview(reviewData);
      setReviews([...reviews, submittedReview]);
      setNewReview('');
      setRating(0);
    } catch (error) {
      console.error('Failed to submit review', error);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return interactive ? (
        <span 
          key={index} 
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setRating(starValue)}
        >
          {starValue <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      ) : (
        starValue <= rating ? <FaStar key={index} /> : <FaRegStar key={index} />
      );
    });
  };

  return (
    <section className="review-section">
      <h2>Avis Clients</h2>
      
      {/* Affichage des avis existants */}
      <div className="existing-reviews">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <FaUserCircle />
              <span>{review.user.name}</span>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
            </div>
            <p>{review.text}</p>
          </div>
        ))}
      </div>

      {/* Formulaire d'ajout d'avis */}
      {user && (
        <div className="add-review-form">
          <h3>Donnez votre avis</h3>
          <div className="review-rating-input">
            {renderStars(rating, true)}
          </div>
          <textarea 
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Votre avis détaillé..."
          />
          <button 
            onClick={handleSubmitReview}
            disabled={!newReview || rating === 0}
          >
            Publier l'avis
          </button>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
