import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="container">
      <div className="not-found">
        <h1>404</h1>
        <p>Page not found</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
