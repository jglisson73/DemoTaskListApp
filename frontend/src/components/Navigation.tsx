import React from 'react';
import { useAppContext } from '../context/AppContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  const { state, dispatch } = useAppContext();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>TaskFlow</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Welcome, {state.user?.username}!
        </p>
      </div>

      <nav>
        <button
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
        >
          📊 Dashboard
        </button>

        <button
          className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
          onClick={() => onViewChange('tasks')}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
        >
          ✅ Tasks
        </button>

        <button
          className={`nav-item ${activeView === 'projects' ? 'active' : ''}`}
          onClick={() => onViewChange('projects')}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
        >
          📁 Projects
        </button>

        <button
          className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => onViewChange('profile')}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
        >
          👤 Profile
        </button>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button
          className="btn btn-secondary"
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navigation;