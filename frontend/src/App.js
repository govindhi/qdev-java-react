import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskFilter from './components/TaskFilter';
import { getAllTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from './services/taskService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again later.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setError(null);
      const newTask = await createTask(taskData);
      setTasks([newTask, ...tasks]);
    } catch (err) {
      setError('Failed to create task. Please check your input and try again.');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      setError(null);
      const updatedTask = await updateTask(id, taskData);
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      setEditingTask(null);
      // Success feedback could be added here if needed
    } catch (err) {
      setError('Failed to update task. Please check your input and try again.');
      console.error('Error updating task:', err);
      // Keep editing mode active so user can retry
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleCompletion = async (id) => {
    try {
      const updatedTask = await toggleTaskCompletion(id);
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error('Error toggling task completion:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setError(null);
    // Scroll to form when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="container">
      <div className="header">
        <h1>Task Manager</h1>
      </div>
      
      {error && <div className="error-message-banner">{error}</div>}
      
      <TaskForm 
        onSubmit={editingTask ? (taskData) => handleUpdateTask(editingTask.id, taskData) : handleCreateTask} 
        initialData={editingTask}
        onCancel={editingTask ? () => setEditingTask(null) : null}
      />
      
      <TaskFilter activeFilter={filter} onFilterChange={setFilter} />
      
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList 
          tasks={filteredTasks} 
          onDelete={handleDeleteTask} 
          onToggleCompletion={handleToggleCompletion}
          onEdit={handleEditTask}
        />
      )}
    </div>
  );
}

export default App;
