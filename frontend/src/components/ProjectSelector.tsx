import React, { useState } from 'react';
import { useAppContext, Project } from '../context/AppContext';
import { projectsAPI } from '../services/api';

interface ProjectSelectorProps {
  onProjectSelect?: (project: Project | null) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onProjectSelect }) => {
  const { state, dispatch } = useAppContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProjectSelect = (project: Project | null) => {
    dispatch({ type: 'SELECT_PROJECT', payload: project });
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await projectsAPI.createProject(newProject.name, newProject.description);
      dispatch({ type: 'ADD_PROJECT', payload: response.project });
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      handleProjectSelect(response.project);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Projects</h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreateProject} style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Project description (optional)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              style={{ minHeight: '80px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <button
          className={`nav-item ${!state.selectedProject ? 'active' : ''}`}
          onClick={() => handleProjectSelect(null)}
          style={{
            width: '100%',
            textAlign: 'left',
            background: !state.selectedProject ? '#3b82f6' : 'transparent',
            color: !state.selectedProject ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          📋 All Projects ({state.tasks.length} tasks)
        </button>
      </div>

      <div>
        {state.projects.map((project) => (
          <button
            key={project.id}
            className={`nav-item ${
              state.selectedProject?.id === project.id ? 'active' : ''
            }`}
            onClick={() => handleProjectSelect(project)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: state.selectedProject?.id === project.id ? '#3b82f6' : 'transparent',
              color: state.selectedProject?.id === project.id ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: '600' }}>{project.name}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                {project.task_count} tasks • {project.member_count} members
              </div>
            </div>
          </button>
        ))}
      </div>

      {state.projects.length === 0 && !showCreateForm && (
        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
          No projects yet. Create your first project to get started!
        </p>
      )}
    </div>
  );
};

export default ProjectSelector;