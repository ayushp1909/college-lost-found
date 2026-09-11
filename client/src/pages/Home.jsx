import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">College Campus Lost &amp; Found</h1>
        <p className="hero-subtitle">
          Easily report lost belongings or post items you have found around campus.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/post-item" className="btn btn-primary">
                Post an Item
              </Link>
              <Link to="/lost-items" className="btn btn-secondary">
                Browse Lost Items
              </Link>
              <Link to="/found-items" className="btn btn-secondary">
                Browse Found Items
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Log In to Start
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create an Account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <h3>🔍 Report Lost Items</h3>
          <p>Misplaced your keys, wallet, or ID card? Post details so fellow students can help you find it.</p>
        </div>
        <div className="feature-card">
          <h3>📦 Post Found Items</h3>
          <p>Found something on campus? Post the location and description to help the owner reclaim it safely.</p>
        </div>
        <div className="feature-card">
          <h3>🔒 Verified Campus Community</h3>
          <p>Secure authentication ensures items are managed safely and owners maintain full control of their listings.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
