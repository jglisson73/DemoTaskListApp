import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { state } = useAppContext();

  const taskStats = {
    total: state.tasks.length,
    todo: state.tasks.filter(t => t.status === 'Todo').length,
    inProgress: state.tasks.filter(t => t.status === 'In Progress').length,
    completed: state.tasks.filter(t => t.status === 'Completed').length,
    overdue: state.tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed'
    ).length,
  };

  const recentTasks = state.tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const upcomingTasks = state.tasks
    .filter(t => t.due_date && t.status !== 'Completed')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome back, {state.user?.username}!</p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#3b82f6', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            {taskStats.total}
          </h3>
          <p style={{ margin: 0, color: '#64748b' }}>Total Tasks</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            {taskStats.todo}
          </h3>
          <p style={{ margin: 0, color: '#64748b' }}>Todo</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#2563eb', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            {taskStats.inProgress}
          </h3>
          <p style={{ margin: 0, color: '#64748b' }}>In Progress</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#16a34a', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            {taskStats.completed}
          </h3>
          <p style={{ margin: 0, color: '#64748b' }}>Completed</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#dc2626', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            {taskStats.overdue}
          </h3>
          <p style={{ margin: 0, color: '#64748b' }}>Overdue</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Overall Progress</h3>
        <div style={{ 
          backgroundColor: '#e2e8f0', 
          borderRadius: '8px', 
          height: '20px',
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}>
          <div 
            style={{ 
              backgroundColor: '#16a34a', 
              height: '100%', 
              width: `${completionRate}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <p style={{ margin: 0, color: '#64748b' }}>
          {completionRate}% of tasks completed ({taskStats.completed} out of {taskStats.total})
        </p>
      </div>

      {/* Recent and Upcoming Tasks */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem'
      }}>
        {/* Recent Tasks */}
        <div className="card">
          <h3>Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No tasks yet</p>
          ) : (
            <div>
              {recentTasks.map((task) => (
                <div 
                  key={task.id} 
                  style={{ 
                    padding: '0.75rem',
                    borderLeft: `4px solid ${task.status === 'Completed' ? '#16a34a' : '#3b82f6'}`,
                    backgroundColor: '#f8fafc',
                    marginBottom: '0.5rem',
                    borderRadius: '0 4px 4px 0'
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{task.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {task.project_name} • {task.status} • {formatDate(task.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <h3>Upcoming Deadlines</h3>
          {upcomingTasks.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No upcoming deadlines</p>
          ) : (
            <div>
              {upcomingTasks.map((task) => {
                const isOverdue = new Date(task.due_date!) < new Date();
                return (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '0.75rem',
                      borderLeft: `4px solid ${isOverdue ? '#dc2626' : '#ea580c'}`,
                      backgroundColor: isOverdue ? '#fef2f2' : '#fff7ed',
                      marginBottom: '0.5rem',
                      borderRadius: '0 4px 4px 0'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{task.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {task.project_name} • Due: {formatDate(task.due_date!)}
                      {isOverdue && <span style={{ color: '#dc2626' }}> (Overdue)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Projects Overview */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Projects Overview</h3>
        {state.projects.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>No projects yet</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem'
          }}>
            {state.projects.map((project) => (
              <div 
                key={project.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h4>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: '#64748b', 
                  fontSize: '0.875rem' 
                }}>
                  {project.description || 'No description'}
                </p>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {project.task_count} tasks • {project.member_count} members
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;