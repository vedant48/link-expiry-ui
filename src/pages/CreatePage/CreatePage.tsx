import React, { useState } from 'react';
import { createLink } from '../../services/api';
import {
  CreatedLinkMetadata,
  CreateLinkDto,
  EXPIRY_OPTIONS,
} from '../../types/link';
import { CreateSuccess } from '../../components/CreateSuccess/CreateSuccess';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '../../components/Icons';

export const CreatePage: React.FC = () => {
  // Form State
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(3600); // default 1 hour
  const [enableMaxVisits, setEnableMaxVisits] = useState(false);
  const [maxVisits, setMaxVisits] = useState<number>(5);
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [oneTime, setOneTime] = useState(false);

  // Status & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdMetadata, setCreatedMetadata] = useState<CreatedLinkMetadata | null>(null);

  // Field errors
  const [messageError, setMessageError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [visitsError, setVisitsError] = useState<string | null>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 100) {
      setMessage(val);
      if (messageError && val.trim().length > 0) {
        setMessageError(null);
      }
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!message.trim()) {
      setMessageError('Message is required.');
      isValid = false;
    } else if (message.length > 100) {
      setMessageError('Message cannot exceed 100 characters.');
      isValid = false;
    } else {
      setMessageError(null);
    }

    if (enablePassword) {
      if (!password) {
        setPasswordError('Password is required when protection is enabled.');
        isValid = false;
      } else if (password.length < 4) {
        setPasswordError('Password must be at least 4 characters.');
        isValid = false;
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }

    if (enableMaxVisits) {
      if (!maxVisits || maxVisits < 1 || !Number.isInteger(Number(maxVisits))) {
        setVisitsError('Maximum visits must be an integer of at least 1.');
        isValid = false;
      } else {
        setVisitsError(null);
      }
    } else {
      setVisitsError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLinkDto = {
      message: message.trim(),
      expiresIn,
      ...(enableMaxVisits ? { maxVisits: Number(maxVisits) } : {}),
      ...(enablePassword && password ? { password } : {}),
      ...(oneTime ? { oneTime: true } : {}),
    };

    try {
      const response = await createLink(payload);
      setCreatedMetadata({
        code: response.code,
        expiresAt: response.expiresAt,
        expiresIn,
        maxVisits: enableMaxVisits ? Number(maxVisits) : undefined,
        hasPassword: enablePassword && Boolean(password),
        oneTime,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setExpiresIn(3600);
    setEnableMaxVisits(false);
    setMaxVisits(5);
    setEnablePassword(false);
    setPassword('');
    setShowPassword(false);
    setOneTime(false);
    setErrorMessage(null);
    setMessageError(null);
    setPasswordError(null);
    setVisitsError(null);
    setCreatedMetadata(null);
  };

  if (createdMetadata) {
    return <CreateSuccess metadata={createdMetadata} onReset={handleReset} />;
  }

  return (
    <div className="card">
      <div className="page-header">
        <h1 className="page-title">Temporary Message</h1>
        <p className="page-description">
          Share a message that disappears automatically based on time or access limits.
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <AlertCircleIcon className="alert-icon" size={18} />
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Message Input */}
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="message-input" className="form-label">
              Message
            </label>
            <span
              className={`character-count ${message.length === 100 ? 'limit-reached' : ''}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {message.length} / 100
            </span>
          </div>

          <textarea
            id="message-input"
            className="textarea-field"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your secret or temporary note here..."
            rows={4}
            maxLength={100}
            required
            aria-invalid={Boolean(messageError)}
            aria-describedby={messageError ? 'message-error' : undefined}
            disabled={isSubmitting}
          />
          {messageError && (
            <p id="message-error" className="input-error-msg" role="alert">
              <AlertCircleIcon size={14} />
              {messageError}
            </p>
          )}
        </div>

        {/* Expiration Selector */}
        <div className="form-group">
          <label className="form-label" id="expiration-label">
            Expiration
          </label>
          <div
            className="segmented-control"
            role="radiogroup"
            aria-labelledby="expiration-label"
          >
            {EXPIRY_OPTIONS.map((option) => (
              <div key={option.seconds} className="segmented-item">
                <input
                  type="radio"
                  id={`expiry-${option.seconds}`}
                  name="expiration"
                  value={option.seconds}
                  checked={expiresIn === option.seconds}
                  onChange={() => setExpiresIn(option.seconds)}
                  className="segmented-input"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor={`expiry-${option.seconds}`}
                  className="segmented-label"
                  title={option.description}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          <p className="helper-text">
            The message will become permanently unavailable after this period.
          </p>
        </div>

        {/* Optional Settings Section */}
        <div className="settings-section">
          <h2 className="settings-title">Optional Protection & Limits</h2>

          {/* Maximum Visits */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title">Access limit</div>
              <div className="setting-desc">
                Expire after a specific number of successful views
              </div>
              {enableMaxVisits && (
                <div className="setting-expandable-content">
                  <label htmlFor="max-visits-input" className="form-label">
                    Allowed views
                  </label>
                  <input
                    type="number"
                    id="max-visits-input"
                    className="input-field"
                    min={1}
                    max={100000}
                    value={maxVisits}
                    onChange={(e) => {
                      setMaxVisits(parseInt(e.target.value, 10) || 1);
                      setVisitsError(null);
                    }}
                    disabled={isSubmitting}
                    aria-describedby={visitsError ? 'visits-error' : undefined}
                  />
                  {visitsError && (
                    <p id="visits-error" className="input-error-msg" role="alert">
                      <AlertCircleIcon size={14} />
                      {visitsError}
                    </p>
                  )}
                </div>
              )}
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={enableMaxVisits}
                onChange={(e) => setEnableMaxVisits(e.target.checked)}
                disabled={isSubmitting}
                aria-label="Toggle access limit"
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Password Protection */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title">Password protection</div>
              <div className="setting-desc">
                Require the recipient to enter a password before viewing
              </div>
              {enablePassword && (
                <div className="setting-expandable-content">
                  <label htmlFor="password-input" className="form-label">
                    Password (min 4 characters)
                  </label>
                  <div className="input-with-button-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password-input"
                      className="input-field"
                      placeholder="Enter a secure password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError && e.target.value.length >= 4) {
                          setPasswordError(null);
                        }
                      }}
                      minLength={4}
                      disabled={isSubmitting}
                      aria-describedby={passwordError ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="input-inline-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="password-error" className="input-error-msg" role="alert">
                      <AlertCircleIcon size={14} />
                      {passwordError}
                    </p>
                  )}
                </div>
              )}
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={enablePassword}
                onChange={(e) => {
                  setEnablePassword(e.target.checked);
                  if (!e.target.checked) {
                    setPassword('');
                    setPasswordError(null);
                  }
                }}
                disabled={isSubmitting}
                aria-label="Toggle password protection"
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* One-time message */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title">One-time view</div>
              <div className="setting-desc">
                Delete message immediately after first successful access
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={oneTime}
                onChange={(e) => setOneTime(e.target.checked)}
                disabled={isSubmitting}
                aria-label="Toggle one-time deletion"
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ marginTop: '1.75rem' }}>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || !message.trim()}
            id="create-message-btn"
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create temporary message</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
