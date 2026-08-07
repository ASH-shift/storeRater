import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load stats'));
  }, []);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>Admin Dashboard</h1>

      {error && <div className="error-text">{error}</div>}

      {!stats && !error && <p>Loading stats...</p>}

      {stats && (
        <div className="stat-cards">
          <div className="stat-card card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card card">
            <div className="stat-number">{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card card">
            <div className="stat-number">{stats.totalRatings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <a href="/admin/users" className="btn btn-primary">Manage Users</a>
        <a href="/admin/stores" className="btn btn-primary">Manage Stores</a>
        <a href="/admin/users/add" className="btn btn-secondary">Add User</a>
        <a href="/admin/stores/add" className="btn btn-secondary">Add Store</a>
      </div>
    </div>
  );
}

export default AdminDashboard;
