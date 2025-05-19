import React from 'react';

const TaskFilter = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="filter-tabs">
      <div 
        className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        All
      </div>
      <div 
        className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
        onClick={() => onFilterChange('active')}
      >
        Active
      </div>
      <div 
        className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
        onClick={() => onFilterChange('completed')}
      >
        Completed
      </div>
    </div>
  );
};

export default TaskFilter;
