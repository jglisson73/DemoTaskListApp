import React, { useState, useEffect } from 'react';
import { useAppContext, Task } from '../context/AppContext';
import { tasksAPI } from '../services/api';
import { formatDateTimeLocal } from '../utils/helpers';

interface TaskFormProps {
  task?: Task;
  onSubmit?: (task: Task) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    status: 'Todo',
    tags: '',
    project_id: '',
    assignee_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: formatDateTimeLocal(task.due_date),
        priority: task.priority,
        status: task.status,
        tags: task.tags.join(', '),
        project_id: task.project_id.toString(),
        assignee_id: task.assignee_id?.toString() || '',
      });
    } else if (state.selectedProject) {
      setFormData(prev => ({
        ...prev,
        project_id: state.selectedProject!.id.toString(),
      }));
    }
  }, [task, state.selectedProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project_id) return;

    setLoading(true);
    setError('');

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.due_date || undefined,
        priority: formData.priority,
        status: formData.status,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        project_id: parseInt(formData.project_id),
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
      };

      let response;
      if (task) {
        response = await tasksAPI.updateTask(task.id, taskData);
        dispatch({ type: 'UPDATE_TASK', payload: response.task });
      } else {
        response = await tasksAPI.createTask(taskData);
        dispatch({ type: 'ADD_TASK', payload: response.task });
      }

      if (onSubmit) {
        onSubmit(response.task);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="project_id">
              Project *
            </label>
            <select
              id="project_id"
              name="project_id"
              className="form-select"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Project</option>
              {state.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="due_date">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              className="form-input"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="form-input"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., urgent, backend, review"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;