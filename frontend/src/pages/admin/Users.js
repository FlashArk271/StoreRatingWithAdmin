import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { validateForm } from '../../utils/validation';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters, sortConfig]);

  const fetchUsers = async () => {
    try {
      const params = {
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      const response = await api.get('/users', { params });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validateForm(formData, ['name', 'email', 'password', 'address']);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ASC' ? '↑' : '↓';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      <div className="card">
        <div className="filters">
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
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Name <span className="sort-icon">{getSortIcon('name')}</span>
                  </th>
                  <th onClick={() => handleSort('email')}>
                    Email <span className="sort-icon">{getSortIcon('email')}</span>
                  </th>
                  <th onClick={() => handleSort('address')}>
                    Address <span className="sort-icon">{getSortIcon('address')}</span>
                  </th>
                  <th onClick={() => handleSort('role')}>
                    Role <span className="sort-icon">{getSortIcon('role')}</span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || '-'}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/users/${user.id}`} className="btn btn-secondary btn-small">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No users found</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        {apiError && <div className="alert alert-error">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name (20-60 characters)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter full name"
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Enter email"
            />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>
          <div className="form-group">
            <label>Password (8-16 chars, 1 uppercase, 1 special)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              placeholder="Enter password"
            />
            {formErrors.password && <div className="form-error">{formErrors.password}</div>}
          </div>
          <div className="form-group">
            <label>Address (max 400 chars)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Enter address"
            />
            {formErrors.address && <div className="form-error">{formErrors.address}</div>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleFormChange}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default AdminUsers;
