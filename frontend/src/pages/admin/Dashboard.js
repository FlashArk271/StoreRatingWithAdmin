import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stores">🏪</div>
          <div className="stat-content">
            <h3>{stats.totalStores}</h3>
            <p>Total Stores</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ratings">⭐</div>
          <div className="stat-content">
            <h3>{stats.totalRatings}</h3>
            <p>Total Ratings</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
