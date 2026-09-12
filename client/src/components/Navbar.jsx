import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <span className="nav-brand-icon" aria-hidden="true">
            <svg
              className="nav-brand-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <polyline points="8 11.5 10.5 14 14.5 9" />
            </svg>
          </span>
          <span className="nav-brand-text">KIET Lost &amp; Found</span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={`nav-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <div className="hamburger-icon">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="nav-menu">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/lost-items" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Lost Items
              </NavLink>
              <NavLink to="/found-items" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Found Items
              </NavLink>
              <NavLink to="/post-item" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Post Item
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Dashboard
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Admin
                </NavLink>
              )}
              <div className="nav-user-chip">
                <span>Hi, {user?.name}</span>
                {user?.role === 'admin' && <span className="nav-role-badge">Admin</span>}
              </div>
              <button onClick={handleLogout} className="btn-logout" type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile Collapsible Drawer */}
      {isOpen && (
        <div className="mobile-nav-drawer">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/lost-items" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                Lost Items
              </NavLink>
              <NavLink to="/found-items" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                Found Items
              </NavLink>
              <NavLink to="/post-item" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                + Post Item
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                Dashboard
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                  🛡️ Admin Panel
                </NavLink>
              )}
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <span>Signed in as <strong>{user?.name}</strong></span>
                  {user?.role === 'admin' && <span className="badge badge-match">Admin</span>}
                </div>
                <button onClick={handleLogout} className="btn-mobile-logout" type="button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')} onClick={closeMenu}>
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
