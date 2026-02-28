import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PostFilters from '@/components/PostFilters';
import './MobileNav.css';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleFilterSelect = () => {
    onClose();
    if (location.pathname !== '/') navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div
      ref={overlayRef}
      id="mobile-nav"
      className={`mobile-nav${isOpen ? ' mobile-nav--open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Header row */}
      <div className="mobile-nav-header">
        <Link to="/" className="mobile-nav-logo" onClick={onClose}>
          slaapyhoofd<span className="mobile-nav-logo-tld">.nl</span>
        </Link>
        <button
          ref={closeButtonRef}
          className="mobile-nav-close"
          aria-label="Close menu"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
        >
          ✕
        </button>
      </div>

      {/* Nav links */}
      <nav className="mobile-nav-links" aria-label="Mobile navigation">
        <ul>
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to} className={`mobile-nav-item${isActive ? ' mobile-nav-item--active' : ''}`}>
                <Link to={to} onClick={onClose} tabIndex={isOpen ? 0 : -1}>
                  <span className="mobile-nav-label">{label}</span>
                  {isActive && <span className="mobile-nav-arrow" aria-hidden="true">→</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Filters: topics + date, both shown inline (no tabs on mobile) */}
      <div className="mobile-nav-filters">
        <PostFilters
          mode="inline"
          onFilterSelect={handleFilterSelect}
          tabIndex={isOpen ? 0 : -1}
        />
      </div>

      {/* Footer */}
      <div className="mobile-nav-footer">
        slaapyhoofd.nl · © {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default MobileNav;


