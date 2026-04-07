import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page not-found">
      <h1 className="not-found-code">404</h1>
      <h2 className="page-title">Page Not Found</h2>
      <p className="page-subtitle">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
