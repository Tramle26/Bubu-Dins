import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PortfolioLesson from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PortfolioLesson />
  </StrictMode>
);
