import axios from 'axios';
import { User, Project, Task, Comment } from '../context/AppContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (email: string, password?: string) => {
    const response = await api.put('/auth/profile', {
      email,
      ...(password && { password }),
    });
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getProjects: async (): Promise<{ projects: Project[] }> => {
    const response = await api.get('/api/projects');
    return response.data;
  },

  createProject: async (name: string, description?: string): Promise<{ project: Project }> => {
    const response = await api.post('/api/projects', {
      name,
      description: description || '',
    });
    return response.data;
  },

  getProject: async (id: number): Promise<{ project: Project }> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  updateProject: async (id: number, name: string, description?: string): Promise<{ project: Project }> => {
    const response = await api.put(`/api/projects/${id}`, {
      name,
      description: description || '',
    });
    return response.data;
  },

  deleteProject: async (id: number) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },

  addMember: async (projectId: number, username: string, role: string = 'Member') => {
    const response = await api.post(`/api/projects/${projectId}/members`, {
      username,
      role,
    });
    return response.data;
  },

  removeMember: async (projectId: number, userId: number) => {
    const response = await api.delete(`/api/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (filters?: {
    project_id?: number;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<{ tasks: Task[] }> => {
    const params = new URLSearchParams();
    if (filters?.project_id) params.append('project_id', filters.project_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/api/tasks?${params.toString()}`);
    return response.data;
  },

  createTask: async (taskData: {
    title: string;
    description?: string;
    due_date?: string;
    priority?: string;
    status?: string;
    tags?: string[];
    project_id: number;
    assignee_id?: number;
  }): Promise<{ task: Task }> => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  getTask: async (id: number): Promise<{ task: Task & { comments: Comment[] } }> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id: number, taskData: Partial<{
    title: string;
    description: string;
    due_date: string | null;
    priority: string;
    status: string;
    tags: string[];
    assignee_id: number | null;
  }>): Promise<{ task: Task }> => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: number) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },

  addComment: async (taskId: number, content: string): Promise<{ comment: Comment }> => {
    const response = await api.post(`/api/tasks/${taskId}/comments`, {
      content,
    });
    return response.data;
  },
};

export default api;