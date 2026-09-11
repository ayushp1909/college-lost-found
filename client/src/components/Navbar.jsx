import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Campus Lost &amp; Found
        </Link>

        <div className="nav-links">
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
              <span className="nav-user-greeting">Hi, {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
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
    </nav>
  );
};

export default Navbar;
