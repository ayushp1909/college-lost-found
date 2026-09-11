import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Success message if redirected from register
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: {
          email: formData.email.trim(),
          password: formData.password
        }
      });

      // Store in auth context and localStorage
      login(data.token, data.user);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <div className="auth-brand-badge" aria-hidden="true">
          📍
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to manage your campus lost &amp; found items</p>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">College Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="student@college.edu"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
