import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="footer-logo">
          slaapyhoofd<span className="footer-logo-tld">.nl</span>
        </Link>
        <div className="footer-links">
          <a href="https://github.com/slaapyhoofd" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="/rss">RSS</a>
        </div>
        <span className="footer-copyright">© {currentYear}</span>
      </div>
    </footer>
  );
}

export default Footer;
