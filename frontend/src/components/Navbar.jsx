import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="nav-link brand-link">StoreRater</Link>
      </div>
      <div className="nav-links">
        {user && user.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/admin/users" className="nav-link">Users</Link>
            <Link to="/admin/stores" className="nav-link">Stores</Link>
          </>
        )}
        {user && user.role === 'normal' && (
          <>
            <Link to="/stores" className="nav-link">Browse Stores</Link>
            <Link to="/change-password" className="nav-link">Change Password</Link>
          </>
        )}
        {user && user.role === 'store_owner' && (
          <>
            <Link to="/store-owner/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/change-password" className="nav-link">Change Password</Link>
          </>
        )}
        {user && (
          <div className="nav-user-info">
            <span className="nav-username">{user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
          </div>
        )}
        {!user && (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
