from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        from app import User, Task, Project
        
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        project_id = request.args.get('project_id', type=int)
        status = request.args.get('status')
        priority = request.args.get('priority')
        search = request.args.get('search')
        
        # Build query
        query = Task.query.join(Project).filter(
            (Project.owner_id == current_user_id) | 
            (Task.assignee_id == current_user_id) |
            (Task.created_by == current_user_id)
        )
        
        if project_id:
            query = query.filter(Task.project_id == project_id)
        
        if status:
            query = query.filter(Task.status == status)
        
        if priority:
            query = query.filter(Task.priority == priority)
        
        if search:
            query = query.filter(Task.title.contains(search) | Task.description.contains(search))
        
        tasks = query.order_by(Task.created_at.desc()).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        from app import db, Task, Project
        
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('project_id'):
            return jsonify({'error': 'Title and project_id are required'}), 400
        
        # Verify user has access to the project
        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        if project.owner_id != current_user_id:
            # TODO: Check if user is a member of the project
            pass
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid due_date format'}), 400
        
        # Create new task
        new_task = Task(
            title=data['title'],
            description=data.get('description', ''),
            due_date=due_date,
            priority=data.get('priority', 'Medium'),
            status=data.get('status', 'Todo'),
            tags=','.join(data.get('tags', [])) if data.get('tags') else '',
            project_id=data['project_id'],
            assignee_id=data.get('assignee_id'),
            created_by=current_user_id
        )
        
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task': new_task.to_dict()
        }), 201
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        from app import Task, Project, Comment
        
        current_user_id = get_jwt_identity()
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check if user has access to this task
        project = Project.query.get(task.project_id)
        if (project.owner_id != current_user_id and 
            task.assignee_id != current_user_id and 
            task.created_by != current_user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get comments for this task
        comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.asc()).all()
        
        task_dict = task.to_dict()
        task_dict['comments'] = [comment.to_dict() for comment in comments]
        
        return jsonify({'task': task_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        from app import db, Task, Project
        
        current_user_id = get_jwt_identity()
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check if user has access to this task
        project = Project.query.get(task.project_id)
        if (project.owner_id != current_user_id and 
            task.assignee_id != current_user_id and 
            task.created_by != current_user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        if 'title' in data:
            task.title = data['title']
        
        if 'description' in data:
            task.description = data['description']
        
        if 'due_date' in data:
            if data['due_date']:
                try:
                    task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'error': 'Invalid due_date format'}), 400
            else:
                task.due_date = None
        
        if 'priority' in data:
            task.priority = data['priority']
        
        if 'status' in data:
            task.status = data['status']
        
        if 'tags' in data:
            task.tags = ','.join(data['tags']) if data['tags'] else ''
        
        if 'assignee_id' in data:
            task.assignee_id = data['assignee_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Task updated successfully',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        from app import db, Task, Project
        
        current_user_id = get_jwt_identity()
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check if user has access to delete this task
        project = Project.query.get(task.project_id)
        if project.owner_id != current_user_id and task.created_by != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    try:
        from app import db, Task, Project, Comment
        
        current_user_id = get_jwt_identity()
        
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check if user has access to this task
        project = Project.query.get(task.project_id)
        if (project.owner_id != current_user_id and 
            task.assignee_id != current_user_id and 
            task.created_by != current_user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        if not data or not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        new_comment = Comment(
            task_id=task_id,
            user_id=current_user_id,
            content=data['content']
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comment added successfully',
            'comment': new_comment.to_dict()
        }), 201
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500