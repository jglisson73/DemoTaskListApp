import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { authAPI, projectsAPI, tasksAPI } from './services/api';
import AuthForm from './components/AuthForm';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import ProjectSelector from './components/ProjectSelector';
import UserProfile from './components/UserProfile';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      if (state.token) {
        try {
          // Get user profile
          const userResponse = await authAPI.getProfile();
          dispatch({
            type: 'SET_USER',
            payload: {
              user: userResponse.user,
              token: state.token,
            },
          });

          // Load projects and tasks
          const [projectsResponse, tasksResponse] = await Promise.all([
            projectsAPI.getProjects(),
            tasksAPI.getTasks(),
          ]);

          dispatch({ type: 'SET_PROJECTS', payload: projectsResponse.projects });
          dispatch({ type: 'SET_TASKS', payload: tasksResponse.tasks });
        } catch (error) {
          console.error('Failed to initialize app:', error);
          dispatch({ type: 'LOGOUT' });
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, [state.token, dispatch]);

  // Auto-refresh tasks when projects change
  useEffect(() => {
    const refreshTasks = async () => {
      if (state.user && state.projects.length > 0) {
        try {
          const tasksResponse = await tasksAPI.getTasks();
          dispatch({ type: 'SET_TASKS', payload: tasksResponse.tasks });
        } catch (error) {
          console.error('Failed to refresh tasks:', error);
        }
      }
    };

    refreshTasks();
  }, [state.projects, dispatch, state.user]);

  if (loading) {
    return (
      <div className="loading" style={{ height: '100vh' }}>
        <div>Loading TaskFlow...</div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!state.user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'white',
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋 TaskFlow</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Manage your tasks and projects efficiently
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            <ProjectSelector />
            <TaskList
              showCreateForm={showTaskForm}
              onCreateFormToggle={setShowTaskForm}
            />
          </div>
        );
      case 'projects':
        return <ProjectSelector />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      
      <div className="main-content">
        <div className="header">
          <h2>
            {activeView === 'dashboard' && '📊 Dashboard'}
            {activeView === 'tasks' && '✅ Tasks'}
            {activeView === 'projects' && '📁 Projects'}
            {activeView === 'profile' && '👤 Profile'}
          </h2>
          
          {activeView === 'tasks' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>
        
        <div className="content">
          {state.error && (
            <div className="error" style={{ marginBottom: '1rem' }}>
              {state.error}
            </div>
          )}
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
