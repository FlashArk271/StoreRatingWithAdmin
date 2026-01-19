import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      setError('User not found');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading"><div className="spinner"></div></div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-error">{error}</div>
        <Link to="/admin/users" className="btn btn-secondary">Back to Users</Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>User Details</h1>
        <Link to="/admin/users" className="btn btn-secondary btn-small">
          ← Back to Users
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <strong>Name:</strong>
            <p>{user.name}</p>
          </div>
          <div>
            <strong>Email:</strong>
            <p>{user.email}</p>
          </div>
          <div>
            <strong>Address:</strong>
            <p>{user.address || 'Not provided'}</p>
          </div>
          <div>
            <strong>Role:</strong>
            <p>
              <span className={`badge badge-${user.role}`}>
                {user.role.replace('_', ' ')}
              </span>
            </p>
          </div>
          {user.role === 'store_owner' && (
            <div>
              <strong>Store Rating:</strong>
              <div className="rating-display" style={{ marginTop: '8px' }}>
                <StarRating rating={Math.round(user.rating || 0)} readonly />
                <span className="rating-value">
                  {user.rating ? user.rating.toFixed(1) : 'No ratings yet'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminUserDetail;
