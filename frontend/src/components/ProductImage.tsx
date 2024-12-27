import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  width = '100%',
  height = 'auto'
}) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      effect="blur"
      className={`product-image ${className}`}
      width={width}
      height={height}
      placeholderSrc="/path/to/placeholder.jpg"  // Ajoutez un placeholder
    />
  );
};

export default ProductImage;
