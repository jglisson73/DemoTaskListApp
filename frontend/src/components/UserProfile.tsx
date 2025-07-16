import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { authAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';

const UserProfile: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: state.user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = { email: formData.email };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await authAPI.updateProfile(updateData.email, updateData.password);
      
      // Update user in context
      dispatch({
        type: 'SET_USER',
        payload: {
          user: response.user,
          token: state.token!,
        },
      });

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      email: state.user?.email || '',
      password: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
  };

  if (!state.user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      
      <div className="card">
        <div className="card-header">
          <h3>Personal Information</h3>
          {!isEditing && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-input"
                value={state.user.username}
                disabled
                style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
              />
              <small style={{ color: '#64748b' }}>Username cannot be changed</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>

            {formData.password && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Username:</label>
              <p style={{ margin: '0.25rem 0', color: '#64748b' }}>{state.user.username}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Email:</label>
              <p style={{ margin: '0.25rem 0', color: '#64748b' }}>{state.user.email}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Member Since:</label>
              <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
                {formatDateTime(state.user.created_at)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Last Updated:</label>
              <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
                {formatDateTime(state.user.updated_at)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="card">
        <h3>Account Statistics</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#3b82f6' }}>
              {state.projects.length}
            </div>
            <div style={{ color: '#64748b' }}>Projects</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#16a34a' }}>
              {state.tasks.length}
            </div>
            <div style={{ color: '#64748b' }}>Total Tasks</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#dc2626' }}>
              {state.tasks.filter(t => t.created_by === state.user?.id).length}
            </div>
            <div style={{ color: '#64748b' }}>Created Tasks</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#ea580c' }}>
              {state.tasks.filter(t => t.assignee_id === state.user?.id).length}
            </div>
            <div style={{ color: '#64748b' }}>Assigned Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;