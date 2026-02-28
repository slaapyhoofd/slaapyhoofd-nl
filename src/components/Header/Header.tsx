import { Link } from 'react-router-dom';
import './Header.css';
import { config } from '@/config';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="header-logo">
            {config.siteName}
          </Link>
          <nav className="header-nav" aria-label="Main navigation">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
