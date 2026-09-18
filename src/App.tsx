import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/Header';
import { AppRoutes } from './router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />
        <main className="main-content" id="main-content">
          <AppRoutes />
        </main>
        <footer className="site-footer">
          <p>Temporary Messages &bull; End-to-end expiry utility &bull; Zero tracking</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
