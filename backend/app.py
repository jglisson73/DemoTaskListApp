import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-string'  # Change this in production!
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    owned_projects = db.relationship('Project', backref='owner', lazy=True, foreign_keys='Project.owner_id')
    assigned_tasks = db.relationship('Task', backref='assignee', lazy=True, foreign_keys='Task.assignee_id')
    created_tasks = db.relationship('Task', backref='creator', lazy=True, foreign_keys='Task.created_by')
    comments = db.relationship('Comment', backref='author', lazy=True)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    priority = db.Column(db.String(20), default='Medium')  # Low, Medium, High, Critical
    status = db.Column(db.String(20), default='Todo')  # Todo, In Progress, Completed
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    comments = db.relationship('Comment', backref='task', lazy=True, cascade='all, delete-orphan')

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Auth Routes
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        password_hash = generate_password_hash(password)
        user = User(username=username, email=email, password_hash=password_hash)
        
        db.session.add(user)
        db.session.commit()
        
        # Create a default project for the user
        default_project = Project(name='My Tasks', description='Default project', owner_id=user.id)
        db.session.add(default_project)
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'access_token': access_token, 'user_id': user.id}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=str(user.id))
            return jsonify({'access_token': access_token, 'user_id': user.id}), 200
        
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Task Routes
@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        user_id = int(get_jwt_identity())
        project_id = request.args.get('project_id')
        status = request.args.get('status')
        
        query = Task.query.join(Project).filter(Project.owner_id == user_id)
        
        if project_id:
            query = query.filter(Task.project_id == project_id)
        if status:
            query = query.filter(Task.status == status)
        
        tasks = query.all()
        
        task_list = []
        for task in tasks:
            task_list.append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'priority': task.priority,
                'status': task.status,
                'project_id': task.project_id,
                'project_name': task.project.name,
                'assignee_id': task.assignee_id,
                'assignee_name': task.assignee.username if task.assignee else None,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat()
            })
        
        return jsonify(task_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate project ownership
        project = Project.query.filter_by(id=data.get('project_id'), owner_id=user_id).first()
        if not project:
            return jsonify({'message': 'Project not found or access denied'}), 404
        
        task = Task(
            title=data.get('title'),
            description=data.get('description', ''),
            due_date=datetime.fromisoformat(data.get('due_date')) if data.get('due_date') else None,
            priority=data.get('priority', 'Medium'),
            status=data.get('status', 'Todo'),
            project_id=data.get('project_id'),
            assignee_id=data.get('assignee_id'),
            created_by=user_id
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'priority': task.priority,
            'status': task.status,
            'project_id': task.project_id,
            'created_at': task.created_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        task = Task.query.join(Project).filter(
            Task.id == task_id,
            Project.owner_id == user_id
        ).first()
        
        if not task:
            return jsonify({'message': 'Task not found or access denied'}), 404
        
        # Update fields
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        if 'priority' in data:
            task.priority = data['priority']
        if 'status' in data:
            task.status = data['status']
        if 'assignee_id' in data:
            task.assignee_id = data['assignee_id']
        
        db.session.commit()
        
        return jsonify({'message': 'Task updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        user_id = int(get_jwt_identity())
        
        task = Task.query.join(Project).filter(
            Task.id == task_id,
            Project.owner_id == user_id
        ).first()
        
        if not task:
            return jsonify({'message': 'Task not found or access denied'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Project Routes
@app.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    try:
        user_id = int(get_jwt_identity())
        projects = Project.query.filter_by(owner_id=user_id).all()
        
        project_list = []
        for project in projects:
            task_count = Task.query.filter_by(project_id=project.id).count()
            project_list.append({
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'task_count': task_count,
                'created_at': project.created_at.isoformat()
            })
        
        return jsonify(project_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        project = Project(
            name=data.get('name'),
            description=data.get('description', ''),
            owner_id=user_id
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'created_at': project.created_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)