import React from 'react';
import { Task } from '../context/AppContext';
import { formatDate, getPriorityColor, getStatusColor, truncateText } from '../utils/helpers';

interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task, e.target.value);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task);
    }
  };

  return (
    <div
      className={`task-item ${task.status === 'Completed' ? 'completed' : ''}`}
      onClick={() => onClick && onClick(task)}
    >
      <div className="task-header">
        <div style={{ flex: 1 }}>
          <h4 className="task-title">{task.title}</h4>
          {task.description && (
            <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
              {truncateText(task.description, 100)}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="form-select"
            style={{ fontSize: '0.875rem', padding: '0.25rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {onEdit && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleEdit}
              title="Edit task"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              title="Delete task"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="task-meta">
        <span
          className="priority-badge"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
        
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status}
        </span>

        <span>📁 {task.project_name}</span>

        {task.assignee_name && (
          <span>👤 {task.assignee_name}</span>
        )}

        {task.due_date && (
          <span style={{ color: new Date(task.due_date) < new Date() ? '#dc2626' : '#64748b' }}>
            📅 {formatDate(task.due_date)}
            {new Date(task.due_date) < new Date() && ' (Overdue)'}
          </span>
        )}

        {task.tags.length > 0 && (
          <span>
            🏷️ {task.tags.slice(0, 3).join(', ')}
            {task.tags.length > 3 && ` +${task.tags.length - 3} more`}
          </span>
        )}

        {task.comment_count > 0 && (
          <span>💬 {task.comment_count}</span>
        )}
      </div>
    </div>
  );
};

export default TaskItem;