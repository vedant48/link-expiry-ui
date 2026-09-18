import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CreatePage } from '../pages/CreatePage/CreatePage';
import { LinkPage } from '../pages/LinkPage/LinkPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CreatePage />} />
      <Route path="/link/:code" element={<LinkPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
