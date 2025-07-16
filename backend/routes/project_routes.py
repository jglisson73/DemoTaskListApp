from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    try:
        from app import User, Project, ProjectMember
        
        current_user_id = get_jwt_identity()
        
        # Get projects owned by user or where user is a member
        owned_projects = Project.query.filter_by(owner_id=current_user_id).all()
        member_projects = Project.query.join(ProjectMember).filter(
            ProjectMember.user_id == current_user_id
        ).all()
        
        # Combine and deduplicate projects
        all_projects = list({p.id: p for p in owned_projects + member_projects}.values())
        
        return jsonify({
            'projects': [project.to_dict() for project in all_projects]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    try:
        from app import db, Project, ProjectMember
        
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Project name is required'}), 400
        
        # Create new project
        new_project = Project(
            name=data['name'],
            description=data.get('description', ''),
            owner_id=current_user_id
        )
        
        db.session.add(new_project)
        db.session.flush()  # To get the project ID
        
        # Add the owner as a member with admin role
        project_member = ProjectMember(
            project_id=new_project.id,
            user_id=current_user_id,
            role='Owner'
        )
        
        db.session.add(project_member)
        db.session.commit()
        
        return jsonify({
            'message': 'Project created successfully',
            'project': new_project.to_dict()
        }), 201
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    try:
        from app import Project, ProjectMember
        
        current_user_id = get_jwt_identity()
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user has access to this project
        if (project.owner_id != current_user_id and 
            not ProjectMember.query.filter_by(project_id=project_id, user_id=current_user_id).first()):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get project members
        members = ProjectMember.query.filter_by(project_id=project_id).all()
        
        project_dict = project.to_dict()
        project_dict['members'] = [member.to_dict() for member in members]
        
        return jsonify({'project': project_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    try:
        from app import db, Project
        
        current_user_id = get_jwt_identity()
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Only owner can update project details
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Only project owner can update project details'}), 403
        
        data = request.get_json()
        
        if 'name' in data:
            project.name = data['name']
        
        if 'description' in data:
            project.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Project updated successfully',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    try:
        from app import db, Project
        
        current_user_id = get_jwt_identity()
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Only owner can delete project
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Only project owner can delete project'}), 403
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': 'Project deleted successfully'}), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/projects/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_member(project_id):
    try:
        from app import db, User, Project, ProjectMember
        
        current_user_id = get_jwt_identity()
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Only owner can add members
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Only project owner can add members'}), 403
        
        data = request.get_json()
        if not data or not data.get('username'):
            return jsonify({'error': 'Username is required'}), 400
        
        # Find user by username
        user = User.query.filter_by(username=data['username']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already a member
        existing_member = ProjectMember.query.filter_by(
            project_id=project_id, 
            user_id=user.id
        ).first()
        if existing_member:
            return jsonify({'error': 'User is already a member of this project'}), 400
        
        # Add new member
        new_member = ProjectMember(
            project_id=project_id,
            user_id=user.id,
            role=data.get('role', 'Member')
        )
        
        db.session.add(new_member)
        db.session.commit()
        
        return jsonify({
            'message': 'Member added successfully',
            'member': new_member.to_dict()
        }), 201
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@projects_bp.route('/projects/<int:project_id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_member(project_id, user_id):
    try:
        from app import db, Project, ProjectMember
        
        current_user_id = get_jwt_identity()
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Only owner can remove members (except themselves)
        if project.owner_id != current_user_id and user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Cannot remove the owner
        if user_id == project.owner_id:
            return jsonify({'error': 'Cannot remove project owner'}), 400
        
        member = ProjectMember.query.filter_by(
            project_id=project_id, 
            user_id=user_id
        ).first()
        
        if not member:
            return jsonify({'error': 'Member not found in this project'}), 404
        
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({'message': 'Member removed successfully'}), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500