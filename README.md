# TaskFlow - Task Management Web Application

A modern, full-stack task management application built with React and Flask, implementing all features from the TaskManagementAppPRD.md requirements.

## Features

### 🔐 User Authentication
- User registration and login system
- JWT-based authentication
- Password reset functionality
- User profile management

### ✅ Task Management System
- Create, read, update, delete tasks (CRUD operations)
- Task properties including:
  - Title and description
  - Due date and time
  - Priority levels (Low, Medium, High, Critical)
  - Status (Todo, In Progress, Completed)
  - Tags/categories
  - Assignee for team tasks

### 📁 Organization Features
- Create and manage projects/workspaces
- Organize tasks within projects
- Filter and search tasks
- Sort by various criteria (date, priority, status)

### 👥 Collaboration Features
- Share projects with team members
- Assign tasks to specific users
- Add comments to tasks
- Real-time notifications for task updates

### 📊 Dashboard & Analytics
- Personal dashboard with task overview
- Progress tracking and completion statistics
- Calendar view of due dates
- Team productivity metrics

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **API**: RESTful endpoints
- **CORS**: Flask-CORS for cross-origin requests

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: React Context API with useReducer
- **HTTP Client**: Axios
- **Styling**: CSS Modules with custom responsive design
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## Project Structure

```
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── routes/
│   │   ├── auth_routes.py     # Authentication endpoints
│   │   ├── task_routes.py     # Task CRUD endpoints
│   │   └── project_routes.py  # Project CRUD endpoints
│   └── models/
│       ├── user.py           # User model
│       ├── project.py        # Project model
│       ├── task.py           # Task model
│       ├── comment.py        # Comment model
│       └── project_member.py # Project membership model
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # State management
│   │   ├── services/         # API services
│   │   ├── utils/            # Helper functions
│   │   └── App.tsx           # Main application component
│   ├── package.json
│   └── public/
└── README.md
```

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/comments` - Add comment to task

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get specific project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/members` - Add member to project
- `DELETE /api/projects/{id}/members/{user_id}` - Remove member from project

## Database Schema

### Users Table
- id, username, email, password_hash, created_at, updated_at

### Projects Table
- id, name, description, owner_id, created_at, updated_at

### Tasks Table
- id, title, description, due_date, priority, status, project_id, assignee_id, created_by, created_at, updated_at

### Comments Table
- id, task_id, user_id, content, created_at

### Project_Members Table
- project_id, user_id, role, joined_at

## Features Implemented

✅ **Core Features**:
- [x] User authentication with JWT
- [x] Task CRUD operations
- [x] Project management
- [x] Task filtering and search
- [x] Priority and status management
- [x] Task comments

✅ **UI/UX**:
- [x] Modern, responsive design
- [x] Sidebar navigation
- [x] Dashboard with statistics
- [x] Task cards with priority/status indicators
- [x] Form validation and error handling

✅ **Technical Requirements**:
- [x] React 18+ with TypeScript
- [x] Flask backend with SQLite
- [x] JWT authentication
- [x] RESTful API design
- [x] State management with Context API
- [x] Responsive design

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Projects**: Start by creating projects to organize your tasks
3. **Add Tasks**: Create tasks within projects with priorities, due dates, and descriptions
4. **Manage Tasks**: Update status, edit details, add comments
5. **Dashboard**: View overall progress and statistics
6. **Profile**: Manage your account settings

## Development

### Frontend Development
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Backend Development
```bash
cd backend
python app.py      # Start Flask development server
```

## Deployment

### Frontend
The frontend can be deployed to any static hosting service:
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend
The Flask backend can be deployed to services like Heroku, AWS, or any VPS:
1. Update the database configuration for production
2. Set environment variables for secrets
3. Use a production WSGI server like Gunicorn

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.