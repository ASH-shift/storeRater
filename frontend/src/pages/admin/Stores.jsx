import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const res = await api.get('/admin/stores', { params });
      setStores(res.data);
    } catch {
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'avg_rating',
      label: 'Average Rating',
      sortable: true,
      render: (row) => row.avg_rating ? Number(row.avg_rating).toFixed(1) : '—'
    }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Stores</h1>
        <Link to="/admin/stores/add" className="btn btn-primary">+ Add Store</Link>
      </div>

      <div className="filter-bar card">
        <input
          type="text"
          name="name"
          placeholder="Filter by name..."
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by email..."
          value={filters.email}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Filter by address..."
          value={filters.address}
          onChange={handleFilterChange}
        />
      </div>

      {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}
      {loading && <p>Loading stores...</p>}

      {!loading && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <SortableTable columns={columns} data={stores} />
        </div>
      )}
    </div>
  );
}

export default AdminStores;
