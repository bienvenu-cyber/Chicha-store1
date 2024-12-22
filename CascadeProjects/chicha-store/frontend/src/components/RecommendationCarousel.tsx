import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button,
  CircularProgress
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useRecommendations } from '../hooks/useRecommendations';
import { Product } from '../services/productService';

interface RecommendationCarouselProps {
  type?: 'personalized' | 'related' | 'browsing';
  context?: {
    currentProductId?: string;
    currentCategory?: string;
  };
  onProductSelect?: (product: Product) => void;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  type = 'personalized',
  context,
  onProductSelect
}) => {
  const { 
    personalizedRecommendations,
    relatedProducts,
    browsingRecommendations,
    loading
  } = useRecommendations(context);

  const getRecommendations = () => {
    switch (type) {
      case 'personalized': return personalizedRecommendations;
      case 'related': return relatedProducts;
      case 'browsing': return browsingRecommendations;
    }
  };

  const recommendations = getRecommendations();

  const renderTitle = () => {
    switch (type) {
      case 'personalized': 
        return 'Recommandés pour vous';
      case 'related': 
        return 'Produits similaires';
      case 'browsing': 
        return 'Basé sur votre navigation';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Typography variant="body2" align="center">
        Pas de recommandations disponibles
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Typography variant="h6" gutterBottom>
        {renderTitle()}
      </Typography>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          600: { slidesPerView: 2 },
          900: { slidesPerView: 3 },
          1200: { slidesPerView: 4 }
        }}
      >
        {recommendations.map((product) => (
          <SwiperSlide key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {product.price.toFixed(2)} €
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => onProductSelect?.(product)}
                >
                  Voir le produit
                </Button>
              </CardActions>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
