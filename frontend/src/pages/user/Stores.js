import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });
  const [submitting, setSubmitting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStores();
  }, [filters, sortConfig]);

  const fetchStores = async () => {
    try {
      const params = {
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      const response = await api.get('/stores', { params });
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRating = async (storeId, rating) => {
    setSubmitting(storeId);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/ratings', { store_id: storeId, rating });
      setMessage({ type: 'success', text: 'Rating submitted successfully!' });
      fetchStores(); // Refresh to get updated ratings
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit rating' });
    } finally {
      setSubmitting(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ASC' ? '↑' : '↓';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Stores</h1>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="filters">
          <input
            type="text"
            name="name"
            placeholder="Search by name..."
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Search by address..."
            value={filters.address}
            onChange={handleFilterChange}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Store Name <span className="sort-icon">{getSortIcon('name')}</span>
                  </th>
                  <th onClick={() => handleSort('address')}>
                    Address <span className="sort-icon">{getSortIcon('address')}</span>
                  </th>
                  <th onClick={() => handleSort('average_rating')}>
                    Overall Rating <span className="sort-icon">{getSortIcon('average_rating')}</span>
                  </th>
                  <th>Your Rating</th>
                  <th>Submit Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address || '-'}</td>
                    <td>
                      <div className="rating-display">
                        <StarRating rating={Math.round(Number(store.average_rating) || 0)} readonly />
                        <span className="rating-value">
                          {store.average_rating ? Number(store.average_rating).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {store.user_rating ? (
                        <div className="rating-display">
                          <StarRating rating={store.user_rating} readonly />
                          <span className="rating-value">{store.user_rating}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#888' }}>Not rated</span>
                      )}
                    </td>
                    <td>
                      <div style={{ opacity: submitting === store.id ? 0.5 : 1 }}>
                        <StarRating
                          rating={store.user_rating || 0}
                          onRate={(rating) => handleRating(store.id, rating)}
                        />
                        <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>
                          {store.user_rating ? 'Click to update' : 'Click to rate'}
                        </small>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stores.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No stores found</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserStores;
