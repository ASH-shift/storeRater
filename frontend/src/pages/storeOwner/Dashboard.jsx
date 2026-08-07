import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/store-owner/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'user_name', label: 'Customer Name', sortable: true },
    { key: 'user_email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (row) => `${row.rating} / 5` }
  ];

  if (loading) return <div className="container"><p>Loading dashboard...</p></div>;
  if (error) return <div className="container"><div className="error-text">{error}</div></div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>Store Owner Dashboard</h1>

      {data && !data.store && (
        <div className="card">
          <p style={{ color: '#666' }}>No store assigned to your account yet. Please contact an admin.</p>
        </div>
      )}

      {data && data.store && (
        <>
          <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '8px', color: '#1a1a2e' }}>{data.store.name}</h2>
            <p style={{ color: '#666', marginBottom: '12px' }}>Your Store</p>
            {data.store.avgRating ? (
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e6a817' }}>
                  {Number(data.store.avgRating).toFixed(1)}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>out of 5</div>
                <div style={{ marginTop: '8px', color: '#666' }}>
                  Based on {data.raters.length} rating{data.raters.length !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <p style={{ color: '#999', fontSize: '1.1rem' }}>No ratings yet</p>
            )}
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0 }}>Customers Who Rated Your Store</h3>
            </div>
            <SortableTable columns={columns} data={data.raters} />
          </div>
        </>
      )}
    </div>
  );
}

export default StoreOwnerDashboard;
