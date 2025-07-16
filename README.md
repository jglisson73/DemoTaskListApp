# Task Management Application

A modern task management web application built with React and Flask that allows users to create, organize, and track personal and team tasks.

## Features

- **User Authentication**: JWT-based registration and login
- **Task Management**: Create, read, update, and delete tasks
- **Project Organization**: Organize tasks within projects
- **Priority Management**: Set task priorities (Low, Medium, High, Critical)
- **Status Tracking**: Track task status (Todo, In Progress, Completed)
- **Filtering & Search**: Filter tasks by status and project
- **Dashboard**: Overview of task statistics
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Python Flask with SQLAlchemy
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS Modules with modern responsive design

## Project Structure

```
DemoTaskListApp/
├── backend/
│   ├── app.py              # Flask application with API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main React application
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Styles
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── package.json       # Node.js dependencies
│   └── tsconfig.json      # TypeScript configuration
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

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will be available at `http://localhost:3000`

## Usage

1. **Registration**: Create a new account with username, email, and password
2. **Login**: Access your account with username and password
3. **Dashboard**: View task statistics and overview
4. **Create Tasks**: Add new tasks with title, description, priority, and due date
5. **Manage Tasks**: Edit, update status, or delete existing tasks
6. **Filter Tasks**: Use filters to view tasks by status or project
7. **Projects**: Tasks are automatically organized in projects (default project created on registration)

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /api/user` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project

## Database Schema

### Users
- id, username, email, password_hash, created_at

### Projects
- id, name, description, owner_id, created_at, updated_at

### Tasks
- id, title, description, due_date, priority, status, project_id, assignee_id, created_by, created_at, updated_at

## Security Features

- Password hashing using Werkzeug
- JWT token-based authentication
- CORS enabled for frontend-backend communication
- Input validation and error handling

## Development

### Running Tests

Backend tests:
```bash
cd backend
source venv/bin/activate
python -m pytest
```

Frontend tests:
```bash
cd frontend
npm test
```

### Building for Production

Frontend build:
```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.