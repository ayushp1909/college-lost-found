import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>Campus Portal</span>
        </div>
        <h1 className="hero-title">Find what you lost. Return what you found.</h1>
        <p className="hero-subtitle">
          A centralized campus Lost &amp; Found portal for reporting, discovering, and recovering misplaced items.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/post-item" className="btn btn-primary">
                + Report an Item
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

      {/* How It Works Section */}
      <section>
        <h2 className="section-title">How It Works</h2>
        <p className="section-desc">
          A simple, automated workflow designed to connect misplaced items with their rightful owners across campus.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              📝
            </div>
            <h3>1. Report or Post</h3>
            <p>
              Misplaced or found an item? Submit key details including title, category, campus location, date, and an optional image.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              ⚡
            </div>
            <h3>2. Semantic AI Matching</h3>
            <p>
              Google Gemini text embeddings automatically analyze descriptions to surface potential matches between lost and found items.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              🤝
            </div>
            <h3>3. Connect &amp; Recover</h3>
            <p>
              Review item details and locations through the platform to coordinate smooth recovery of your belongings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
