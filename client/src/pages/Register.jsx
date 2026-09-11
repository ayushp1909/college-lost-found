import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        }
      });

      // On success, redirect to /login
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create an Account</h2>
      <p className="auth-subtitle">Join the Campus Lost &amp; Found portal</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">College Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="student@college.edu"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
};

export default Register;
