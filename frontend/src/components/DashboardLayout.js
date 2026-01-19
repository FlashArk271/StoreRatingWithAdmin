import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get navigation links based on role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/admin/users', label: 'Users', icon: '👥' },
        { to: '/admin/stores', label: 'Stores', icon: '🏪' }
      ];
    }
    if (user?.role === 'store_owner') {
      return [
        { to: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/owner/password', label: 'Change Password', icon: '🔒' }
      ];
    }
    return [
      { to: '/stores', label: 'Stores', icon: '🏪' },
      { to: '/password', label: 'Change Password', icon: '🔒' }
    ];
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Store Rating</h2>
          <p>{user?.role?.replace('_', ' ')}</p>
        </div>
        <nav className="sidebar-nav">
          {getNavLinks().map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
            <span>🚪</span>
            Logout
          </button>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
