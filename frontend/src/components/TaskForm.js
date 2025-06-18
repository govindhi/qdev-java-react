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
      
      // Format the date properly for datetime-local input
      if (initialData.dueDate) {
        // Convert ISO string to local datetime format (YYYY-MM-DDThh:mm)
        const date = new Date(initialData.dueDate);
        const localDatetime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          .toISOString()
          .substring(0, 16);
        setDueDate(localDatetime);
      } else {
        setDueDate('');
      }
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
    
    // If editing, preserve the completed status
    if (initialData && initialData.completed !== undefined) {
      taskData.completed = initialData.completed;
    }
    
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
    <div className="task-form">
      <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>
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
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              className="btn btn-secondary" 
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
