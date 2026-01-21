import React from 'react';

const TaskItem = ({ task, onDelete, onToggleCompletion, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''} ${getPriorityClass()}`}>
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span>Priority: {task.priority.toLowerCase()}</span>
          {task.dueDate && (
            <span> | Due: {formatDate(task.dueDate)}</span>
          )}
          <span> | Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>
      <div className="task-actions">
        <button 
          onClick={() => onToggleCompletion(task.id)}
          className="btn btn-complete"
        >
          {task.completed ? 'Completed' : 'Complete'}
        </button>
        <button 
          onClick={() => onEdit(task)}
          className="btn btn-edit"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="btn btn-secondary"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
