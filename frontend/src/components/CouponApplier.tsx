import React, { useState } from 'react';
import { FaTicketAlt } from 'react-icons/fa';
import { validateCoupon } from '../services/promotionService';

interface CouponApplierProps {
  onCouponApplied: (discount: number) => void;
}

const CouponApplier: React.FC<CouponApplierProps> = ({ onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleCouponApply = async () => {
    try {
      setCouponError('');
      setCouponSuccess('');

      const couponResult = await validateCoupon(couponCode);

      if (couponResult.isValid) {
        setCouponSuccess(`Coupon appliqué : -${couponResult.discountPercentage}%`);
        onCouponApplied(couponResult.discountPercentage);
      } else {
        setCouponError('Coupon invalide ou expiré');
      }
    } catch (error) {
      setCouponError('Erreur lors de la validation du coupon');
      console.error(error);
    }
  };

  return (
    <div className="coupon-applier">
      <div className="coupon-input-group">
        <FaTicketAlt className="coupon-icon" />
        <input
          type="text"
          placeholder="Code promo"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="coupon-input"
        />
        <button 
          onClick={handleCouponApply}
          className="coupon-apply-btn"
          disabled={!couponCode}
        >
          Appliquer
        </button>
      </div>

      {couponError && (
        <div className="coupon-error">{couponError}</div>
      )}

      {couponSuccess && (
        <div className="coupon-success">{couponSuccess}</div>
      )}

      <div className="coupon-hints">
        <p>Codes promotionnels disponibles :</p>
        <ul>
          <li>NOUVEAU10 : -10% pour les nouveaux clients</li>
          <li>CHICHA20 : -20% sur les chichas</li>
          <li>WELCOME15 : -15% sur votre première commande</li>
        </ul>
      </div>
    </div>
  );
};

export default CouponApplier;
