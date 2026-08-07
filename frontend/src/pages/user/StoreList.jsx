import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import RatingModal from '../../components/RatingModal';

function StoreList() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/user/stores', { params });
      setStores(res.data);
    } catch {
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleRateClick = (store) => {
    setSelectedStore(store);
    setModalOpen(true);
  };

  const handleRatingSubmit = async (rating) => {
    try {
      await api.post('/user/ratings', { store_id: selectedStore.id, rating });
      setModalOpen(false);
      setSelectedStore(null);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStore(null);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>Browse Stores</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}
      {loading && <p>Loading stores...</p>}

      {!loading && stores.length === 0 && !error && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#888' }}>No stores found.</p>
        </div>
      )}

      {!loading && stores.length > 0 && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Address</th>
                <th>Overall Rating</th>
                <th>My Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id}>
                  <td style={{ fontWeight: '500' }}>{store.name}</td>
                  <td style={{ color: '#666' }}>{store.address}</td>
                  <td>
                    {store.avg_rating
                      ? <span style={{ color: '#e6a817', fontWeight: 'bold' }}>{Number(store.avg_rating).toFixed(1)} / 5</span>
                      : <span style={{ color: '#999' }}>No ratings</span>
                    }
                  </td>
                  <td>
                    {store.my_rating
                      ? <span style={{ color: '#4a90d9', fontWeight: 'bold' }}>{store.my_rating} / 5</span>
                      : <span style={{ color: '#999' }}>Not rated yet</span>
                    }
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRateClick(store)}
                    >
                      {store.my_rating ? 'Update Rating' : 'Rate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RatingModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleRatingSubmit}
        currentRating={selectedStore?.my_rating || 0}
        storeName={selectedStore?.name || ''}
      />
    </div>
  );
}

export default StoreList;
