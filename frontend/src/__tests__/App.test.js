import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import * as taskService from '../services/taskService';

// Mock the task service
jest.mock('../services/taskService');

describe('App Component - Edit Task Feature', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      priority: 'LOW',
      completed: false,
      createdAt: '2023-01-01T12:00:00.000Z',
      updatedAt: '2023-01-01T12:00:00.000Z'
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      priority: 'HIGH',
      completed: true,
      createdAt: '2023-01-02T12:00:00.000Z',
      updatedAt: '2023-01-02T12:00:00.000Z'
    }
  ];

  beforeEach(() => {
    // Mock the API calls
    taskService.getAllTasks.mockResolvedValue(mockTasks);
    taskService.updateTask.mockImplementation((id, taskData) => {
      const updatedTask = { ...mockTasks.find(task => task.id === id), ...taskData };
      return Promise.resolve(updatedTask);
    });
  });

  test('clicking edit button populates the form with task data', async () => {
    render(<App />);
    
    // Wait for tasks to load
    await waitFor(() => expect(taskService.getAllTasks).toHaveBeenCalled());
    
    // Find and click the edit button on the first task
    const editButtons = await screen.findAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if form is populated with task data
    expect(screen.getByLabelText('Title').value).toBe('Task 1');
    expect(screen.getByLabelText('Description').value).toBe('Description 1');
    expect(screen.getByLabelText('Priority').value).toBe('LOW');
    
    // Check if form is in edit mode
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('submitting the form in edit mode updates the task', async () => {
    render(<App />);
    
    // Wait for tasks to load
    await waitFor(() => expect(taskService.getAllTasks).toHaveBeenCalled());
    
    // Find and click the edit button on the first task
    const editButtons = await screen.findAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Modify the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Task 1' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Description 1' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'MEDIUM' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Task'));
    
    // Check if updateTask was called with correct data
    await waitFor(() => {
      expect(taskService.updateTask).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Updated Task 1',
        description: 'Updated Description 1',
        priority: 'MEDIUM'
      }));
    });
  });

  test('clicking cancel button resets the form', async () => {
    render(<App />);
    
    // Wait for tasks to load
    await waitFor(() => expect(taskService.getAllTasks).toHaveBeenCalled());
    
    // Find and click the edit button on the first task
    const editButtons = await screen.findAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if form is in edit mode
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if form is reset to create mode
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    
    // Check if form fields are reset
    expect(screen.getByLabelText('Title').value).toBe('');
    expect(screen.getByLabelText('Description').value).toBe('');
  });
});