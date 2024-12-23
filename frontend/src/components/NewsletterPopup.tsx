import React, { useState, useEffect } from 'react';
import { FaTimes, FaEnvelope } from 'react-icons/fa';
import { subscribeToNewsletter } from '../services/marketingService';

interface NewsletterPopupProps {
  onClose: () => void;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Afficher le popup après 5 secondes de navigation sur le site
    const timer = setTimeout(() => {
      // Vérifier si le popup n'a pas déjà été vu récemment
      const lastPopupShown = localStorage.getItem('newsletter_popup_timestamp');
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      if (!lastPopupShown || parseInt(lastPopupShown) < oneDayAgo) {
        setShowPopup(true);
        localStorage.setItem('newsletter_popup_timestamp', Date.now().toString());
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 3000);
    } catch (error) {
      setStatus('error');
      console.error('Erreur d\'inscription à la newsletter', error);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="newsletter-popup-overlay">
      <div className="newsletter-popup">
        <button 
          className="newsletter-close-btn" 
          onClick={() => {
            setShowPopup(false);
            onClose();
          }}
        >
          <FaTimes />
        </button>

        <div className="newsletter-content">
          <FaEnvelope className="newsletter-icon" />
          <h2>Rejoignez Notre Communauté Chicha</h2>
          <p>
            Inscrivez-vous à notre newsletter et recevez 
            10% de réduction sur votre première commande !
          </p>

          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Votre email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={status !== 'idle'}>
              {status === 'idle' 
                ? 'Je m\'inscris' 
                : status === 'success' 
                  ? 'Inscription réussie !' 
                  : 'Erreur'}
            </button>
          </form>

          {status === 'error' && (
            <p className="newsletter-error">
              Une erreur s'est produite. Veuillez réessayer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
