import React, { useState, useEffect } from 'react';

const TaskForm = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'MEDIUM');
      setDueDate(initialData.dueDate ? initialData.dueDate.substring(0, 16) : '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null
    };
    
    onSubmit(taskData);
    
    // Reset form if not editing
    if (!initialData) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
    }
  };

  return (
    <div className={`task-form ${initialData ? 'edit-mode' : ''}`}>
      <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>
      {initialData && (
        <div style={{ 
          backgroundColor: '#e65100', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          📝 You are currently editing: "{initialData.title}"
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className={`btn ${initialData ? 'btn-update' : 'btn-primary'}`}>
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              className="btn btn-cancel" 
              onClick={onCancel}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
