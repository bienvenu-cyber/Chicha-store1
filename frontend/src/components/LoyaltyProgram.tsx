import React, { useState, useEffect } from 'react';
import { FaGift, FaStar, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserLoyaltyPoints, 
  redeemLoyaltyReward 
} from '../services/loyaltyService';

const LoyaltyProgram: React.FC = () => {
  const { user } = useAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState([
    { 
      id: 1, 
      name: 'Réduction 10%', 
      pointsCost: 100,
      icon: <FaStar />
    },
    { 
      id: 2, 
      name: 'Livraison Gratuite', 
      pointsCost: 200,
      icon: <FaTrophy />
    },
    { 
      id: 3, 
      name: 'Chicha Offerte', 
      pointsCost: 500,
      icon: <FaGift />
    }
  ]);

  useEffect(() => {
    const loadLoyaltyPoints = async () => {
      if (user) {
        try {
          const points = await getUserLoyaltyPoints(user._id);
          setLoyaltyPoints(points);
        } catch (error) {
          console.error('Erreur de chargement des points', error);
        }
      }
    };

    loadLoyaltyPoints();
  }, [user]);

  const handleRedeemReward = async (rewardId: number) => {
    if (!user) {
      alert('Connectez-vous pour utiliser le programme de fidélité');
      return;
    }

    const reward = availableRewards.find(r => r.id === rewardId);
    
    if (!reward) return;

    if (loyaltyPoints < reward.pointsCost) {
      alert('Pas assez de points');
      return;
    }

    try {
      await redeemLoyaltyReward(user._id, rewardId);
      setLoyaltyPoints(loyaltyPoints - reward.pointsCost);
      alert(`Récompense "${reward.name}" obtenue !`);
    } catch (error) {
      console.error('Erreur de récupération de la récompense', error);
    }
  };

  if (!user) return null;

  return (
    <div className="loyalty-program">
      <h2>Programme de Fidélité</h2>
      <div className="loyalty-points">
        <FaStar /> {loyaltyPoints} points
      </div>

      <div className="loyalty-rewards-grid">
        {availableRewards.map(reward => (
          <div 
            key={reward.id} 
            className={`loyalty-reward ${loyaltyPoints >= reward.pointsCost ? 'available' : 'locked'}`}
          >
            {reward.icon}
            <h3>{reward.name}</h3>
            <p>{reward.pointsCost} points</p>
            <button 
              onClick={() => handleRedeemReward(reward.id)}
              disabled={loyaltyPoints < reward.pointsCost}
            >
              Échanger
            </button>
          </div>
        ))}
      </div>

      <div className="loyalty-info">
        <h3>Comment gagner des points ?</h3>
        <ul>
          <li>Achat : 1€ = 1 point</li>
          <li>Inscription : 50 points bonus</li>
          <li>Anniversaire : 100 points bonus</li>
          <li>Parrainage : 50 points par ami</li>
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyProgram;
