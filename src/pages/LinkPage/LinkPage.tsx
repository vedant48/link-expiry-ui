import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { accessProtectedLink, getLink } from '../../services/api';
import { ApiError } from '../../types/link';
import {
  AlertCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldAlertIcon,
} from '../../components/Icons';

type ViewState =
  | { type: 'loading' }
  | { type: 'success'; message: string }
  | { type: 'protected' }
  | { type: 'expired'; message: string }
  | { type: 'not_found' }
  | { type: 'error'; message: string };

export const LinkPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  const [state, setState] = useState<ViewState>({ type: 'loading' });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchLink = async () => {
    if (!code) {
      setState({ type: 'not_found' });
      return;
    }

    setState({ type: 'loading' });
    setPasswordError(null);

    try {
      const data = await getLink(code);
      setState({ type: 'success', message: data.message });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          // Protected message requires password
          setState({ type: 'protected' });
        } else if (err.statusCode === 404) {
          setState({ type: 'not_found' });
        } else if (err.statusCode === 410) {
          setState({
            type: 'expired',
            message:
              'This message is no longer available. It may have expired, reached its access limit, or already been used.',
          });
        } else {
          setState({ type: 'error', message: err.userMessage });
        }
      } else {
        setState({
          type: 'error',
          message: 'Unable to connect to the server. Please check your connection and try again.',
        });
      }
    }
  };

  useEffect(() => {
    fetchLink();
  }, [code]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || isUnlocking) return;

    if (!password.trim()) {
      setPasswordError('Please enter a password.');
      return;
    }

    setIsUnlocking(true);
    setPasswordError(null);

    try {
      const data = await accessProtectedLink(code, password);
      setState({ type: 'success', message: data.message });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setPasswordError('Incorrect password. Please try again.');
        } else if (err.statusCode === 410) {
          setState({
            type: 'expired',
            message:
              'This message is no longer available. It may have expired, reached its access limit, or already been used.',
          });
        } else if (err.statusCode === 404) {
          setState({ type: 'not_found' });
        } else {
          setPasswordError(err.userMessage);
        }
      } else {
        setPasswordError(
          'Unable to connect to the server. Please check your connection and try again.',
        );
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  // 1. Loading State
  if (state.type === 'loading') {
    return (
      <div className="card" role="status" aria-live="polite">
        <div className="loading-indicator">
          <div className="spinner spinner-primary" aria-hidden="true" style={{ width: 28, height: 28 }} />
          <span>Retrieving message...</span>
        </div>
      </div>
    );
  }

  // 2. Protected Password Form State
  if (state.type === 'protected') {
    return (
      <div className="card">
        <div className="page-header">
          <div className="state-icon-wrapper" style={{ margin: '0 0 1rem 0' }}>
            <LockIcon size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="page-title">Protected message</h1>
          <p className="page-description">
            This message requires a password to view.
          </p>
        </div>

        {passwordError && (
          <div className="alert alert-error" role="alert" id="password-feedback">
            <AlertCircleIcon className="alert-icon" size={18} />
            <div>{passwordError}</div>
          </div>
        )}

        <form onSubmit={handleUnlock} noValidate>
          <div className="form-group">
            <label htmlFor="unlock-password" className="form-label">
              Password
            </label>
            <div className="input-with-button-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="unlock-password"
                className="input-field"
                placeholder="Enter password to unlock"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isUnlocking}
                autoFocus
                required
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'password-feedback' : undefined}
              />
              <button
                type="button"
                className="input-inline-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isUnlocking || !password.trim()}
              id="unlock-button"
            >
              {isUnlocking ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Unlock message</span>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. Success / Unlocked Message State
  if (state.type === 'success') {
    return (
      <div className="card" role="region" aria-label="Temporary Message Content">
        <div className="page-header">
          <h1 className="page-title">Temporary message</h1>
          <p className="page-description">
            Content decrypted and retrieved from server.
          </p>
        </div>

        <div className="message-box">
          <div className="message-text">{state.message}</div>
        </div>

        <div className="message-meta-notice">
          <ClockIcon size={15} />
          <span>This message will disappear automatically based on creator limits.</span>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <Link to="/" className="btn btn-secondary btn-block" id="create-own-btn">
            Create your own temporary message
          </Link>
        </div>
      </div>
    );
  }

  // 4. Expired / Exhausted / Already Used State (HTTP 410)
  if (state.type === 'expired') {
    return (
      <div className="card">
        <div className="state-center">
          <div className="state-icon-wrapper warning">
            <ClockIcon size={24} />
          </div>
          <h1 className="state-title">Message unavailable</h1>
          <p className="state-description">{state.message}</p>
          <Link to="/" className="btn btn-primary" id="expired-create-new-btn">
            Create a new message
          </Link>
        </div>
      </div>
    );
  }

  // 5. Not Found State (HTTP 404)
  if (state.type === 'not_found') {
    return (
      <div className="card">
        <div className="state-center">
          <div className="state-icon-wrapper">
            <ShieldAlertIcon size={24} />
          </div>
          <h1 className="state-title">Message not found</h1>
          <p className="state-description">
            This link may have expired, been deleted, or never existed.
          </p>
          <Link to="/" className="btn btn-primary" id="not-found-home-btn">
            Create a temporary message
          </Link>
        </div>
      </div>
    );
  }

  // 6. Generic or Network Error State
  return (
    <div className="card">
      <div className="state-center">
        <div className="state-icon-wrapper warning">
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="state-title">Unable to load message</h1>
        <p className="state-description">{state.message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={fetchLink}
            className="btn btn-secondary"
            id="retry-fetch-btn"
          >
            Try again
          </button>
          <Link to="/" className="btn btn-primary">
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
};
