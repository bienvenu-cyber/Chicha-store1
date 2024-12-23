import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Input,
  Textarea,
  Button,
  Select,
  Avatar,
  Tag,
  TagLabel,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure
} from '@chakra-ui/react';

interface ForumUser {
  id: string;
  username: string;
  avatar: string;
  rank: 'Novice' | 'Expert' | 'Maître Chicha';
}

interface ForumPost {
  id: string;
  author: ForumUser;
  title: string;
  content: string;
  category: 'Technique' | 'Recettes' | 'Équipement' | 'Général';
  tags: string[];
  likes: number;
  comments: ForumComment[];
  createdAt: Date;
}

interface ForumComment {
  id: string;
  author: ForumUser;
  content: string;
  likes: number;
  createdAt: Date;
}

const CommunityForum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: 'post1',
      author: {
        id: 'user1',
        username: 'ChichaLover42',
        avatar: 'https://example.com/avatar1.jpg',
        rank: 'Expert'
      },
      title: 'Meilleur Mélange de Tabac pour Débutants',
      content: 'Je cherche des recommandations pour un mélange de tabac facile à préparer...',
      category: 'Technique',
      tags: ['Débutant', 'Tabac', 'Conseils'],
      likes: 15,
      comments: [
        {
          id: 'comment1',
          author: {
            id: 'user2',
            username: 'SmokeKing',
            avatar: 'https://example.com/avatar2.jpg',
            rank: 'Maître Chicha'
          },
          content: 'Je recommande un mélange à base de tabac blond avec une touche de fruit...',
          likes: 7,
          createdAt: new Date()
        }
      ],
      createdAt: new Date()
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Général' as ForumPost['category'],
    tags: [] as string[]
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  const categories: ForumPost['category'][] = [
    'Technique', 
    'Recettes', 
    'Équipement', 
    'Général'
  ];

  const availableTags = [
    'Débutant', 
    'Expert', 
    'Tabac', 
    'Mélange', 
    'Technique', 
    'Équipement'
  ];

  const createPost = () => {
    const mockPost: ForumPost = {
      id: `post_${Date.now()}`,
      author: {
        id: 'current_user',
        username: 'UtilisateurActuel',
        avatar: 'https://example.com/current_user.jpg',
        rank: 'Novice'
      },
      ...newPost,
      likes: 0,
      comments: [],
      createdAt: new Date()
    };

    setPosts(prev => [mockPost, ...prev]);
    
    // Réinitialiser le formulaire
    setNewPost({
      title: '',
      content: '',
      category: 'Général',
      tags: []
    });
  };

  const openPostDetails = (post: ForumPost) => {
    setSelectedPost(post);
    onOpen();
  };

  return (
    <Box p={6} maxWidth="800px" margin="auto">
      <Heading mb={6} textAlign="center">
        Communauté Chicha
      </Heading>

      <VStack spacing={4} mb={6}>
        <Heading size="md" alignSelf="flex-start">
          Créer une Discussion
        </Heading>
        
        <Input 
          placeholder="Titre de votre discussion" 
          value={newPost.title}
          onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
        />

        <Textarea 
          placeholder="Détails de votre discussion" 
          value={newPost.content}
          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
        />

        <HStack width="100%">
          <Select 
            placeholder="Catégorie"
            value={newPost.category}
            onChange={(e) => setNewPost(prev => ({ 
              ...prev, 
              category: e.target.value as ForumPost['category'] 
            }))}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

          <Select 
            isMulti 
            placeholder="Tags"
            onChange={(selected) => setNewPost(prev => ({
              ...prev,
              tags: selected.map(item => item.value)
            }))}
          >
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </Select>
        </HStack>

        <Button 
          colorScheme="blue" 
          width="100%"
          onClick={createPost}
          isDisabled={!newPost.title || !newPost.content}
        >
          Publier
        </Button>
      </VStack>

      <Divider my={6} />

      <Heading size="md" mb={4}>
        Discussions Récentes
      </Heading>

      <VStack spacing={4}>
        {posts.map(post => (
          <Box 
            key={post.id} 
            borderWidth="1px" 
            borderRadius="lg" 
            p={4} 
            width="100%"
          >
            <HStack mb={2} justifyContent="space-between">
              <HStack>
                <Avatar 
                  src={post.author.avatar} 
                  name={post.author.username} 
                  size="sm" 
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{post.author.username}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {post.author.rank}
                  </Text>
                </VStack>
              </HStack>
              
              <Tag colorScheme="blue">
                <TagLabel>{post.category}</TagLabel>
              </Tag>
            </HStack>

            <Heading size="sm" mb={2}>{post.title}</Heading>
            <Text noOfLines={2} mb={2}>{post.content}</Text>

            <HStack justifyContent="space-between">
              <HStack>
                {post.tags.map(tag => (
                  <Tag key={tag} size="sm" variant="outline">
                    {tag}
                  </Tag>
                ))}
              </HStack>

              <HStack>
                <Button 
                  size="sm" 
                  colorScheme="green"
                  onClick={() => openPostDetails(post)}
                >
                  Voir Discussion
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedPost?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPost && (
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Avatar 
                    src={selectedPost.author.avatar} 
                    name={selectedPost.author.username} 
                    size="md" 
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{selectedPost.author.username}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {selectedPost.author.rank}
                    </Text>
                  </VStack>
                </HStack>

                <Text>{selectedPost.content}</Text>

                <HStack>
                  {selectedPost.tags.map(tag => (
                    <Tag key={tag} size="sm" variant="outline">
                      {tag}
                    </Tag>
                  ))}
                </HStack>

                <Divider />

                <Heading size="sm">Commentaires ({selectedPost.comments.length})</Heading>

                <VStack spacing={3} align="stretch">
                  {selectedPost.comments.map(comment => (
                    <Box 
                      key={comment.id} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      p={3}
                    >
                      <HStack mb={2}>
                        <Avatar 
                          src={comment.author.avatar} 
                          name={comment.author.username} 
                          size="sm" 
                        />
                        <Text fontWeight="bold">{comment.author.username}</Text>
                      </HStack>
                      <Text>{comment.content}</Text>
                    </Box>
                  ))}
                </VStack>

                <Textarea 
                  placeholder="Votre commentaire..." 
                  mt={4}
                />
                <Button colorScheme="blue" width="100%">
                  Publier le Commentaire
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunityForum;
