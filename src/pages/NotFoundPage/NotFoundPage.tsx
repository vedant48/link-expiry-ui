import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon } from '../../components/Icons';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="card">
      <div className="state-center">
        <div className="state-icon-wrapper">
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="state-title">Page not found</h1>
        <p className="state-description">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" id="return-home-btn">
          Return to homepage
        </Link>
      </div>
    </div>
  );
};
