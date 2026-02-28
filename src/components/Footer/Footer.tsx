import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <a href="https://github.com/slaapyhoofd" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="/rss">RSS</a>
          </div>
          <p className="footer-text">
            &copy; {currentYear} Slaapyhoofd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
