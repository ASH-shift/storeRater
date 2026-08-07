import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;

      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/users/${user.id}`);
      setUserDetail(res.data);
    } catch {
      setUserDetail(user);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetail(null);
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <button className="btn btn-primary btn-sm" onClick={() => handleViewUser(row)}>
          View
        </button>
      )
    }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Users</h1>
        <Link to="/admin/users/add" className="btn btn-primary">+ Add User</Link>
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
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="normal">Normal</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}
      {loading && <p>Loading users...</p>}

      {!loading && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <SortableTable columns={columns} data={users} />
        </div>
      )}

      {selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>User Details</h3>
            {detailLoading ? (
              <p>Loading...</p>
            ) : (
              userDetail && (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr><td style={{ padding: '8px', fontWeight: 'bold', color: '#666' }}>Name</td><td style={{ padding: '8px' }}>{userDetail.name}</td></tr>
                      <tr><td style={{ padding: '8px', fontWeight: 'bold', color: '#666' }}>Email</td><td style={{ padding: '8px' }}>{userDetail.email}</td></tr>
                      <tr><td style={{ padding: '8px', fontWeight: 'bold', color: '#666' }}>Address</td><td style={{ padding: '8px' }}>{userDetail.address}</td></tr>
                      <tr><td style={{ padding: '8px', fontWeight: 'bold', color: '#666' }}>Role</td><td style={{ padding: '8px' }}><span style={{ textTransform: 'capitalize' }}>{userDetail.role?.replace('_', ' ')}</span></td></tr>
                      {userDetail.role === 'store_owner' && (
                        <>
                          <tr><td style={{ padding: '8px', fontWeight: 'bold', color: '#666' }}>Store Name</td><td style={{ padding: '8px' }}>{userDetail.store_name || '—'}</td></tr>
                          <tr><td style={{ padding: '8px', fontWeight: 'bold', color: '#666' }}>Store Avg Rating</td><td style={{ padding: '8px' }}>{userDetail.avg_rating ? `${userDetail.avg_rating} / 5` : '—'}</td></tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
