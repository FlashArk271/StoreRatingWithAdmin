import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import api from '../../services/api';
import { validateForm } from '../../utils/validation';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });
  const [formData, setFormData] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [filters, sortConfig]);

  const fetchStores = async () => {
    try {
      const params = {
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      const response = await api.get('/stores/admin/list', { params });
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'store_owner' } });
      setStoreOwners(response.data);
    } catch (error) {
      console.error('Error fetching store owners:', error);
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

    const validationErrors = validateForm(formData, ['name', 'email', 'address']);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/stores', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to create store');
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
        <h1>Stores</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
          + Add Store
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
                  <th onClick={() => handleSort('average_rating')}>
                    Rating <span className="sort-icon">{getSortIcon('average_rating')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address || '-'}</td>
                    <td>
                      <div className="rating-display">
                        <StarRating rating={Math.round(Number(store.average_rating) || 0)} readonly />
                        <span className="rating-value">
                          {store.average_rating ? Number(store.average_rating).toFixed(1) : 'N/A'}
                        </span>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Store">
        {apiError && <div className="alert alert-error">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store Name (20-60 characters)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter store name"
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
              placeholder="Enter store email"
            />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>
          <div className="form-group">
            <label>Address (max 400 chars)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Enter store address"
            />
            {formErrors.address && <div className="form-error">{formErrors.address}</div>}
          </div>
          <div className="form-group">
            <label>Owner (Optional)</label>
            <select name="owner_id" value={formData.owner_id} onChange={handleFormChange}>
              <option value="">No Owner</option>
              {storeOwners.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default AdminStores;
