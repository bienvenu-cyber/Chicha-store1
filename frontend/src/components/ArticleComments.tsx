import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  IconButton,
  Divider
} from '@mui/material';
import { 
  ThumbUp as LikeIcon, 
  ThumbUpOutlined as LikeOutlinedIcon 
} from '@mui/icons-material';
import { Comment, addComment, likeComment } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ArticleCommentsProps {
  articleId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

const ArticleComments: React.FC<ArticleCommentsProps> = ({ 
  articleId, 
  comments, 
  onCommentAdded 
}) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const handleAddComment = async () => {
    if (!user) {
      showNotification('Vous devez être connecté pour commenter', 'error');
      return;
    }

    if (!newComment.trim()) {
      showNotification('Le commentaire ne peut pas être vide', 'error');
      return;
    }

    try {
      const comment = await addComment(articleId, { content: newComment });
      onCommentAdded(comment);
      setNewComment('');
      showNotification('Commentaire ajouté avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'ajout du commentaire', 'error');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      showNotification('Vous devez être connecté pour liker', 'error');
      return;
    }

    try {
      await likeComment(articleId, commentId);
      showNotification('Commentaire liké', 'success');
    } catch (error) {
      showNotification('Erreur lors du like', 'error');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Commentaires ({comments.length})
      </Typography>

      {/* Formulaire d'ajout de commentaire */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3 
      }}>
        <Avatar 
          src={user?.avatar} 
          sx={{ width: 50, height: 50 }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        
        <TextField
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleAddComment}
          disabled={!user || !newComment.trim()}
        >
          Publier
        </Button>
      </Box>

      {/* Liste des commentaires */}
      {comments.map((comment) => (
        <Box key={comment.id} sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Avatar 
              src={comment.userAvatar} 
              sx={{ width: 40, height: 40 }}
            >
              {comment.userName.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2">
                {comment.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <IconButton 
              color={comment.userLiked ? 'primary' : 'default'}
              onClick={() => handleLikeComment(comment.id)}
            >
              {comment.userLiked ? <LikeIcon /> : <LikeOutlinedIcon />}
              <Typography variant="caption" sx={{ ml: 1 }}>
                {comment.likes}
              </Typography>
            </IconButton>
          </Box>

          <Typography variant="body1" sx={{ ml: '56px', mt: 1 }}>
            {comment.content}
          </Typography>

          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}
    </Box>
  );
};

export default ArticleComments;
