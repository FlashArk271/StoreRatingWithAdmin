import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

function OwnerDashboard() {
  const [data, setData] = useState({ store: null, ratings: [], averageRating: null });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'DESC' });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await api.get('/ratings/my-store');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
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

  const getSortedRatings = () => {
    if (!data.ratings) return [];
    
    return [...data.ratings].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'ASC' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ASC' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ASC' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading"><div className="spinner"></div></div>
      </DashboardLayout>
    );
  }

  if (!data.store) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No store assigned to your account. Please contact the administrator.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stores">🏪</div>
          <div className="stat-content">
            <h3>{data.store.name}</h3>
            <p>Your Store</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ratings">⭐</div>
          <div className="stat-content">
            <h3>{data.averageRating ? data.averageRating.toFixed(1) : 'N/A'}</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <h3>{data.ratings.length}</h3>
            <p>Total Ratings</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>User Ratings</h2>
        </div>

        <div className="rating-display" style={{ marginBottom: '20px' }}>
          <span>Store Average:</span>
          <StarRating rating={Math.round(data.averageRating || 0)} readonly />
          <span className="rating-value">
            {data.averageRating ? data.averageRating.toFixed(1) : 'No ratings yet'}
          </span>
        </div>

        {data.ratings.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No ratings yet. Ratings from users will appear here.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('user_name')}>
                    User Name <span className="sort-icon">{getSortIcon('user_name')}</span>
                  </th>
                  <th onClick={() => handleSort('user_email')}>
                    User Email <span className="sort-icon">{getSortIcon('user_email')}</span>
                  </th>
                  <th onClick={() => handleSort('rating')}>
                    Rating <span className="sort-icon">{getSortIcon('rating')}</span>
                  </th>
                  <th onClick={() => handleSort('created_at')}>
                    Date <span className="sort-icon">{getSortIcon('created_at')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedRatings().map(rating => (
                  <tr key={rating.id}>
                    <td>{rating.user_name}</td>
                    <td>{rating.user_email}</td>
                    <td>
                      <div className="rating-display">
                        <StarRating rating={rating.rating} readonly />
                        <span className="rating-value">{rating.rating}</span>
                      </div>
                    </td>
                    <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default OwnerDashboard;
