import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DocumentIcon, SparkleIcon, CheckCircleIcon } from '../components/Icons';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Editorial Gateway Hero */}
      <section className="hero-section">
        <span className="hero-eyebrow">KIET Group of Institutions · Campus Directory</span>
        <h1 className="hero-title">Find what you lost. Return what you found.</h1>
        <p className="hero-subtitle">
          An authoritative campus Lost &amp; Found platform designed for reporting, discovering, and recovering misplaced items across all college blocks.
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

      {/* Structured 3-Column How It Works Section */}
      <section>
        <h2 className="section-title">How It Works</h2>
        <p className="section-desc">
          A structured campus workflow designed to connect misplaced items with their rightful owners across campus departments.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-step-header">
              <span className="feature-step-num">Step 01</span>
              <span className="feature-step-icon">
                <DocumentIcon size={18} />
              </span>
            </div>
            <h3>Report or Post</h3>
            <p>
              Submit verified item details including title, category, campus location, date, and an optional image to the institutional registry.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-step-header">
              <span className="feature-step-num">Step 02</span>
              <span className="feature-step-icon">
                <SparkleIcon size={18} />
              </span>
            </div>
            <h3>Semantic AI Matching</h3>
            <p>
              Google Gemini text embeddings analyze descriptions to surface potential matching candidates between lost and found items.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-step-header">
              <span className="feature-step-num">Step 03</span>
              <span className="feature-step-icon">
                <CheckCircleIcon size={18} />
              </span>
            </div>
            <h3>Connect &amp; Recover</h3>
            <p>
              Verify item details and campus locations through the platform to coordinate smooth, verified recovery of your belongings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
