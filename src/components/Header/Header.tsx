import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MobileNav from '@/components/MobileNav';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const toggleMenu = useCallback(() => setMenuOpen(v => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-logo" onClick={closeMenu}>
            slaapyhoofd<span className="header-logo-tld">.nl</span>
          </Link>

          {/* Desktop nav */}
          <nav className="header-nav" aria-label="Main navigation">
            <ul>
              <li>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* Hamburger button — mobile only */}
          <button
            className={`header-hamburger${menuOpen ? ' header-hamburger--open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={toggleMenu}
          >
            {menuOpen ? (
              <span className="header-hamburger-close">✕</span>
            ) : (
              <>
                <span></span>
                <span></span>
                <span></span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile nav — rendered outside header to cover full screen */}
      <MobileNav isOpen={menuOpen} onClose={closeMenu} />
    </>
  );
}

export default Header;
