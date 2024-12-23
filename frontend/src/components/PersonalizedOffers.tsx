import React, { useState, useEffect } from 'react';
import { FaTag, FaPercentage } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchPersonalizedOffers, 
  claimPersonalizedOffer 
} from '../services/marketingService';

interface PersonalizedOffer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  validUntil: string;
  requiredPreviousPurchases?: number;
}

const PersonalizedOffers: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [claimedOffers, setClaimedOffers] = useState<string[]>([]);

  useEffect(() => {
    const loadPersonalizedOffers = async () => {
      if (user) {
        try {
          const fetchedOffers = await fetchPersonalizedOffers(user._id);
          setOffers(fetchedOffers);
        } catch (error) {
          console.error('Erreur de chargement des offres', error);
        }
      }
    };

    loadPersonalizedOffers();
  }, [user]);

  const handleClaimOffer = async (offerId: string) => {
    if (!user) {
      alert('Connectez-vous pour profiter des offres');
      return;
    }

    try {
      await claimPersonalizedOffer(user._id, offerId);
      setClaimedOffers([...claimedOffers, offerId]);
      alert('Offre récupérée avec succès !');
    } catch (error) {
      console.error('Erreur de récupération de l\'offre', error);
      alert('Impossible de récupérer l\'offre');
    }
  };

  if (!user || offers.length === 0) return null;

  return (
    <div className="personalized-offers">
      <h2>
        <FaTag /> Offres Personnalisées pour Vous
      </h2>

      <div className="offers-grid">
        {offers.map(offer => {
          const isClaimed = claimedOffers.includes(offer.id);
          const isExpired = new Date(offer.validUntil) < new Date();

          return (
            <div 
              key={offer.id} 
              className={`personalized-offer ${isClaimed ? 'claimed' : ''} ${isExpired ? 'expired' : ''}`}
            >
              <div className="offer-header">
                <FaPercentage />
                <span>{offer.discountPercentage}% de réduction</span>
              </div>

              <div className="offer-details">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>

                {offer.requiredPreviousPurchases && (
                  <p className="offer-condition">
                    Valable après {offer.requiredPreviousPurchases} achats
                  </p>
                )}

                <p className="offer-validity">
                  Valable jusqu'au {new Date(offer.validUntil).toLocaleDateString()}
                </p>
              </div>

              <button 
                onClick={() => handleClaimOffer(offer.id)}
                disabled={isClaimed || isExpired}
              >
                {isClaimed 
                  ? 'Récupérée' 
                  : isExpired 
                    ? 'Expirée' 
                    : 'Récupérer'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalizedOffers;
