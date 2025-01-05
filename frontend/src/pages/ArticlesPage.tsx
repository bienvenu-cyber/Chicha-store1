import React from 'react';
import { Container } from '@mui/material';
import ArticlesList from '../components/ArticlesList';

const ArticlesPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <ArticlesList />
    </Container>
  );
};

export default ArticlesPage;
