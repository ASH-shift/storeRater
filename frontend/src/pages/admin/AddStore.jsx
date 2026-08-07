import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function AddStore() {
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.name || form.name.trim().length === 0) {
      newErrors.name = 'Store name is required';
    } else if (form.name.length > 60) {
      newErrors.name = 'Store name must be at most 60 characters';
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.address || form.address.trim().length === 0) {
      newErrors.address = 'Address is required';
    } else if (form.address.length > 400) {
      newErrors.address = 'Address must be at most 400 characters';
    }
    if (form.owner_id && isNaN(parseInt(form.owner_id))) {
      newErrors.owner_id = 'Owner ID must be a number';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        address: form.address
      };
      if (form.owner_id) {
        payload.owner_id = parseInt(form.owner_id);
      }
      await api.post('/admin/stores', payload);
      setSuccess('Store created successfully!');
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '24px' }}>Add New Store</h1>

        {serverError && <div className="error-text" style={{ marginBottom: '16px' }}>{serverError}</div>}
        {success && <div className="success-msg" style={{ marginBottom: '16px' }}>{success}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Store Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Store name (max 60 chars)" />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Store Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="store@example.com" />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Address</label>
              <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="Full address" />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>Owner ID <span style={{ color: '#999', fontWeight: 'normal' }}>(optional — ID of a store_owner user)</span></label>
              <input
                name="owner_id"
                type="number"
                value={form.owner_id}
                onChange={handleChange}
                placeholder="Enter owner user ID (optional)"
                min="1"
              />
              {errors.owner_id && <span className="error-text">{errors.owner_id}</span>}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Store'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/stores')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStore;
