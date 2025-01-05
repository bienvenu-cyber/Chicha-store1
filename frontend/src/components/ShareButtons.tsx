import React from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Typography 
} from '@mui/material';
import { 
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon
} from '@mui/icons-material';

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank');
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Partager cet article
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Partager sur Facebook">
          <IconButton 
            color="primary" 
            onClick={() => handleShare('facebook')}
          >
            <FacebookIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Partager sur Twitter">
          <IconButton 
            color="primary" 
            onClick={() => handleShare('twitter')}
          >
            <TwitterIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Partager sur LinkedIn">
          <IconButton 
            color="primary" 
            onClick={() => handleShare('linkedin')}
          >
            <LinkedInIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Partager sur WhatsApp">
          <IconButton 
            color="primary" 
            onClick={() => handleShare('whatsapp')}
          >
            <WhatsAppIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Partager par Email">
          <IconButton 
            color="primary" 
            onClick={() => handleShare('email')}
          >
            <EmailIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ShareButtons;
