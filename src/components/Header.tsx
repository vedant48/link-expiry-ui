import React from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand-link" aria-label="Temporary Message Homepage">
          <LinkIcon className="brand-icon" size={20} />
          <span>Temporary Message</span>
        </Link>
      </div>
    </header>
  );
};
