import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNotification } from '../contexts/NotificationContext';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  initialImageUrl?: string;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  initialImageUrl = '',
  label = 'Télécharger une image' 
}) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5 Mo

    if (!validTypes.includes(file.type)) {
      showNotification('Type de fichier non supporté', 'error');
      return;
    }

    if (file.size > maxSize) {
      showNotification('Fichier trop volumineux (max 5 Mo)', 'error');
      return;
    }

    setUploading(true);

    try {
      // Simuler un téléchargement (à remplacer par un vrai service)
      const formData = new FormData();
      formData.append('file', file);
      
      // Exemple de téléchargement (à adapter à votre backend)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }

      const result = await response.json();
      const uploadedImageUrl = result.imageUrl;

      setImageUrl(uploadedImageUrl);
      onImageUpload(uploadedImageUrl);
      showNotification('Image téléchargée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur de téléchargement', 'error');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
      />

      {imageUrl && (
        <Box 
          component="img"
          src={imageUrl}
          alt="Image téléchargée"
          sx={{ 
            maxWidth: '100%', 
            maxHeight: 300, 
            objectFit: 'cover', 
            mb: 2,
            borderRadius: 2 
          }}
        />
      )}

      <Button
        variant="contained"
        color="secondary"
        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        onClick={triggerFileInput}
        disabled={uploading}
      >
        {uploading ? 'Téléchargement...' : label}
      </Button>
    </Box>
  );
};

export default ImageUploader;
