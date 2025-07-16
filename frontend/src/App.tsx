import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

// Types
interface User {
  id: number;
  username: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Completed';
  project_id: number;
  project_name: string;
  assignee_id: number | null;
  assignee_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  task_count: number;
  created_at: string;
}

// Context
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Axios setup
const API_BASE_URL = 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        logout();
      }
    };

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data);
    } catch (error) {
      logout();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await fetchUser();
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/auth/register', { username, email, password });
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await fetchUser();
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const Login: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await auth?.login(username, password);
    if (!success) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-link">
        <span>Don't have an account? </span>
        <button type="button" style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }} onClick={onSwitch}>Register</button>
      </div>
    </div>
  );
};

// Register Component
const Register: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await auth?.register(username, email, password);
    if (!success) {
      setError('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="auth-link">
        <span>Already have an account? </span>
        <button type="button" style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }} onClick={onSwitch}>Login</button>
      </div>
    </div>
  );
};

// Task Item Component
const TaskItem: React.FC<{ task: Task; onUpdate: () => void }> = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        title,
        description,
        status,
        priority
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${task.id}`);
        onUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="task-item">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="task-actions">
          <button className="btn btn-primary" onClick={handleUpdate}>Save</button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div>
          <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
            {task.status}
          </span>
          <span className={`priority priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
      </div>
      {task.description && <p>{task.description}</p>}
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        Project: {task.project_name}
        {task.due_date && ` • Due: ${new Date(task.due_date).toLocaleDateString()}`}
      </div>
      <div className="task-actions">
        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard: React.FC<{ project: Project; onUpdate: () => void }> = ({ project, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/projects/${project.id}`, {
        name,
        description
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks in this project.`)) {
      try {
        await axios.delete(`/api/projects/${project.id}`);
        onUpdate();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="project-card editing">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project description"
            rows={2}
          />
        </div>
        <div className="project-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleUpdate}
            disabled={loading || !name.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setIsEditing(false);
              setName(project.name);
              setDescription(project.description);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-card">
      <div className="project-header">
        <h4 className="project-name">{project.name}</h4>
        <div className="project-menu">
          <button 
            className="btn-icon" 
            onClick={() => setIsEditing(true)}
            title="Edit project"
          >
            ✏️
          </button>
          <button 
            className="btn-icon" 
            onClick={handleDelete}
            title="Delete project"
          >
            🗑️
          </button>
        </div>
      </div>
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}
      <div className="project-stats">
        <span className="task-count">{project.task_count} tasks</span>
        <span className="project-date">
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
const ProjectForm: React.FC<{ onSubmit: () => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/projects', {
        name,
        description
      });
      setName('');
      setDescription('');
      onSubmit();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description (optional)"
              rows={3}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Form Component
const TaskForm: React.FC<{ projects: Project[]; onSubmit: () => void; onCreateProject: () => void }> = ({ projects, onSubmit, onCreateProject }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');

  // Update projectId when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && (projectId === null || !projects.find(p => p.id === projectId))) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that we have a valid project selected
    if (!projectId) {
      console.error('No project selected');
      return;
    }

    try {
      await axios.post('/api/tasks', {
        title,
        description,
        project_id: projectId,
        priority,
        due_date: dueDate || null
      });
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      onSubmit();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="card">
      <h3>Create New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Project</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
              <select
                className="form-control"
                value={projectId || ''}
                onChange={(e) => setProjectId(parseInt(e.target.value))}
                required
                style={{ flex: 1 }}
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onCreateProject}
                title="Create new project"
              >
                +
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={projects.length === 0 || !projectId}>
          Create Task
        </button>
      </form>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState({ status: '', project: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const auth = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleProjectCreated = () => {
    setShowProjectForm(false);
    fetchProjects();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.status && task.status !== filter.status) return false;
    if (filter.project && task.project_id.toString() !== filter.project) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Todo').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length
  };

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <div className="logo">Task Manager</div>
          <div className="nav-links">
            <span>Welcome, {auth?.user?.username}</span>
            <button className="btn btn-secondary" onClick={auth?.logout}>Logout</button>
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="dashboard">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.todo}</div>
            <div className="stat-label">Todo</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <TaskForm 
          projects={projects} 
          onSubmit={fetchTasks} 
          onCreateProject={() => setShowProjectForm(true)}
        />

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Projects</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowProjectForm(true)}
            >
              + New Project
            </button>
          </div>
          {projects.length === 0 ? (
            <p>No projects found. Create your first project!</p>
          ) : (
            <div className="projects-grid">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onUpdate={fetchProjects}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Tasks</h3>
          <div className="filters">
            <div className="filter-group">
              <label className="filter-label">Filter by Status:</label>
              <select
                className="form-control"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Filter by Project:</label>
              <select
                className="form-control"
                value={filter.project}
                onChange={(e) => setFilter({ ...filter, project: e.target.value })}
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <p>No tasks found. Create your first task above!</p>
          ) : (
            filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
            ))
          )}
        </div>
        
        {showProjectForm && (
          <ProjectForm 
            onSubmit={handleProjectCreated}
            onCancel={() => setShowProjectForm(false)}
          />
        )}
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {(auth) => (
          auth?.user ? (
            <Dashboard />
          ) : (
            isLogin ? (
              <Login onSwitch={() => setIsLogin(false)} />
            ) : (
              <Register onSwitch={() => setIsLogin(true)} />
            )
          )
        )}
      </AuthContext.Consumer>
    </AuthProvider>
  );
};

export default App;