import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onDelete, onToggleCompletion, onEdit }) => {
  if (tasks.length === 0) {
    return <p>No tasks found. Add a new task to get started!</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};

export default TaskList;
