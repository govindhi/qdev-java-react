import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from '../components/TaskItem';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  priority: 'HIGH',
  completed: false,
  dueDate: '2024-12-31T23:59:59.000Z',
  createdAt: '2024-01-01T00:00:00.000Z'
};

const mockHandlers = {
  onDelete: jest.fn(),
  onToggleCompletion: jest.fn(),
  onEdit: jest.fn()
};

const renderTaskItemWithTheme = (task = mockTask, theme = 'light') => {
  localStorageMock.getItem.mockReturnValue(theme);
  
  return render(
    <ThemeProvider>
      <TaskItem task={task} {...mockHandlers} />
    </ThemeProvider>
  );
};

describe('TaskItem with Theme Integration', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.removeAttribute('data-theme');
    jest.clearAllMocks();
  });

  test('renders task information correctly', () => {
    renderTaskItemWithTheme();
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/Priority: high/i)).toBeInTheDocument();
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  test('applies correct priority class', () => {
    renderTaskItemWithTheme();
    
    const taskItem = screen.getByText('Test Task').closest('.task-item');
    expect(taskItem).toHaveClass('priority-high');
  });

  test('shows correct button states for incomplete task', () => {
    renderTaskItemWithTheme();
    
    const completeButton = screen.getByText('Complete');
    expect(completeButton).toHaveClass('btn-info');
    
    const editButton = screen.getByText('Edit');
    expect(editButton).toHaveClass('btn-warning');
    
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveClass('btn-secondary');
  });

  test('shows correct button states for completed task', () => {
    const completedTask = { ...mockTask, completed: true };
    renderTaskItemWithTheme(completedTask);
    
    const completedButton = screen.getByText('Completed');
    expect(completedButton).toHaveClass('btn-success');
    
    const taskItem = screen.getByText('Test Task').closest('.task-item');
    expect(taskItem).toHaveClass('completed');
  });

  test('calls handlers when buttons are clicked', () => {
    renderTaskItemWithTheme();
    
    fireEvent.click(screen.getByText('Complete'));
    expect(mockHandlers.onToggleCompletion).toHaveBeenCalledWith(1);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
  });

  test('works correctly in dark theme', () => {
    renderTaskItemWithTheme(mockTask, 'dark');
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    // All buttons should still be rendered with correct classes
    expect(screen.getByText('Complete')).toHaveClass('btn-info');
    expect(screen.getByText('Edit')).toHaveClass('btn-warning');
    expect(screen.getByText('Delete')).toHaveClass('btn-secondary');
  });

  test('handles different priority levels', () => {
    const mediumTask = { ...mockTask, priority: 'MEDIUM' };
    const { rerender } = renderTaskItemWithTheme(mediumTask);
    
    let taskItem = screen.getByText('Test Task').closest('.task-item');
    expect(taskItem).toHaveClass('priority-medium');
    
    const lowTask = { ...mockTask, priority: 'LOW' };
    rerender(
      <ThemeProvider>
        <TaskItem task={lowTask} {...mockHandlers} />
      </ThemeProvider>
    );
    
    taskItem = screen.getByText('Test Task').closest('.task-item');
    expect(taskItem).toHaveClass('priority-low');
  });

  test('handles task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: null };
    renderTaskItemWithTheme(taskWithoutDescription);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('handles task without due date', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: null };
    renderTaskItemWithTheme(taskWithoutDueDate);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    renderTaskItemWithTheme();
    
    // Check that dates are formatted (exact format may vary by locale)
    const metaText = screen.getByText(/Created:/).textContent;
    expect(metaText).toMatch(/Created: \d+\/\d+\/\d+/);
  });
});