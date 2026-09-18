import React, { useState } from 'react';
import { CheckIcon, CopyIcon, LinkIcon } from '../Icons';
import { CreatedLinkMetadata } from '../../types/link';

interface CreateSuccessProps {
  metadata: CreatedLinkMetadata;
  onReset: () => void;
}

export const CreateSuccess: React.FC<CreateSuccessProps> = ({
  metadata,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const fullShareUrl = `${window.location.origin}/link/${metadata.code}`;

  const handleCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullShareUrl);
        success = true;
      }
    } catch {
      // Fallback
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = fullShareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        // Continue
      }
    }

    setCopied(true);
    setCopyFeedback('Link copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setCopyFeedback('');
    }, 2500);
  };

  const formatExpiryTime = (seconds: number): string => {
    if (seconds <= 3600) return 'in 1 hour';
    if (seconds <= 86400) return 'in 1 day';
    if (seconds <= 604800) return 'in 7 days';
    return `in ${Math.round(seconds / 3600)} hours`;
  };

  return (
    <div className="card" role="region" aria-label="Message Created Successfully">
      <div className="page-header">
        <div className="success-badge">
          <CheckIcon size={14} />
          <span>Message Created</span>
        </div>
        <h1 className="page-title">Your temporary message is ready to share</h1>
        <p className="page-description">
          Anyone with this link can view the message according to your settings.
        </p>
      </div>

      <div className="share-box">
        <input
          type="text"
          className="share-url-input"
          value={fullShareUrl}
          readOnly
          onFocus={(e) => e.target.select()}
          aria-label="Shareable message URL"
          id="shareable-url-input"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`btn-copy ${copied ? 'copied' : ''}`}
          aria-live="polite"
          id="copy-link-button"
        >
          {copied ? (
            <>
              <CheckIcon size={16} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon size={16} />
              <span>Copy link</span>
            </>
          )}
        </button>
      </div>

      {copyFeedback && (
        <div className="sr-only" role="status" aria-live="polite">
          {copyFeedback}
        </div>
      )}

      <div className="meta-grid">
        <div className="meta-item">
          <span className="meta-label">Expires</span>
          <span className="meta-value">{formatExpiryTime(metadata.expiresIn)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Access limit</span>
          <span className="meta-value">
            {metadata.maxVisits ? `${metadata.maxVisits} visits` : 'No limit'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Password protected</span>
          <span className="meta-value">{metadata.hasPassword ? 'Yes' : 'No'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">One-time</span>
          <span className="meta-value">{metadata.oneTime ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-block"
          id="create-another-btn"
        >
          Create another message
        </button>
        <a
          href={`/link/${metadata.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-block"
          style={{ textDecoration: 'none' }}
          id="test-link-btn"
        >
          <LinkIcon size={16} />
          <span>Open link</span>
        </a>
      </div>
    </div>
  );
};
