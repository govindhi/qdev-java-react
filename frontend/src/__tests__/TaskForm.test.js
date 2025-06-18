import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../components/TaskForm';

describe('TaskForm Component', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    mockCancel.mockClear();
  });

  test('renders in create mode by default', () => {
    render(<TaskForm onSubmit={mockSubmit} />);
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  test('renders in edit mode when initialData is provided', () => {
    const initialData = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      priority: 'HIGH',
      completed: false,
      dueDate: '2023-12-31T12:00:00.000Z'
    };

    render(<TaskForm onSubmit={mockSubmit} initialData={initialData} onCancel={mockCancel} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Check if form fields are populated with initialData
    expect(screen.getByLabelText('Title').value).toBe('Test Task');
    expect(screen.getByLabelText('Description').value).toBe('Test Description');
    expect(screen.getByLabelText('Priority').value).toBe('HIGH');
  });

  test('submits form data in create mode', () => {
    render(<TaskForm onSubmit={mockSubmit} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'LOW' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Task'));
    
    // Check if onSubmit was called with correct data
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Task',
      description: 'New Description',
      priority: 'LOW',
      dueDate: null
    }));
  });

  test('submits form data in edit mode', () => {
    const initialData = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      priority: 'HIGH',
      completed: true,
      dueDate: '2023-12-31T12:00:00.000Z'
    };

    render(<TaskForm onSubmit={mockSubmit} initialData={initialData} onCancel={mockCancel} />);
    
    // Modify the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Description' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Task'));
    
    // Check if onSubmit was called with correct data
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Updated Task',
      description: 'Updated Description',
      priority: 'HIGH',
      completed: true
    }));
  });

  test('calls onCancel when cancel button is clicked', () => {
    const initialData = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description'
    };

    render(<TaskForm onSubmit={mockSubmit} initialData={initialData} onCancel={mockCancel} />);
    
    // Click the cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if onCancel was called
    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});