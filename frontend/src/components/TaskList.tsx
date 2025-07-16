import React, { useState } from 'react';
import { useAppContext, Task } from '../context/AppContext';
import { tasksAPI } from '../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

interface TaskListProps {
  showCreateForm?: boolean;
  onCreateFormToggle?: (show: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ showCreateForm = false, onCreateFormToggle }) => {
  const { state, dispatch } = useAppContext();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');

  const filteredTasks = state.tasks.filter(task => {
    if (state.selectedProject && task.project_id !== state.selectedProject.id) {
      return false;
    }
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleTaskClick = (task: Task) => {
    // TODO: Open task detail modal
    console.log('Task clicked:', task);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskDelete = async (task: Task) => {
    try {
      await tasksAPI.deleteTask(task.id);
      dispatch({ type: 'DELETE_TASK', payload: task.id });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      const response = await tasksAPI.updateTask(task.id, { status: newStatus });
      dispatch({ type: 'UPDATE_TASK', payload: response.task });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task status');
    }
  };

  const handleTaskSubmit = (task: Task) => {
    setEditingTask(null);
    if (onCreateFormToggle) {
      onCreateFormToggle(false);
    }
  };

  const handleTaskCancel = () => {
    setEditingTask(null);
    if (onCreateFormToggle) {
      onCreateFormToggle(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}

      {(showCreateForm || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          onSubmit={handleTaskSubmit}
          onCancel={handleTaskCancel}
        />
      )}

      <div className="card">
        <div className="card-header">
          <h3>
            Tasks
            {state.selectedProject && ` - ${state.selectedProject.name}`}
            <span style={{ fontWeight: 'normal', color: '#64748b' }}>
              ({filteredTasks.length})
            </span>
          </h3>
          {!showCreateForm && !editingTask && onCreateFormToggle && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onCreateFormToggle(true)}
            >
              + New Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '6px'
        }}>
          <div>
            <input
              type="text"
              name="search"
              placeholder="Search tasks..."
              className="form-input"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <select
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <select
              name="priority"
              className="form-select"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            {state.tasks.length === 0 ? (
              <div>
                <p>No tasks yet.</p>
                <p>Create your first task to get started!</p>
              </div>
            ) : (
              <p>No tasks match your current filters.</p>
            )}
          </div>
        ) : (
          <div>
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={handleTaskClick}
                onEdit={handleTaskEdit}
                onDelete={handleTaskDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;