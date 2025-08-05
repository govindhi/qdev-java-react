import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { ThemeProvider } from '../contexts/ThemeContext';
import * as taskService from '../services/taskService';

// Mock the task service
jest.mock('../services/taskService');

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

const mockTasks = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Description 1',
    priority: 'HIGH',
    completed: false,
    dueDate: '2024-12-31T23:59:59.000Z',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Description 2',
    priority: 'MEDIUM',
    completed: true,
    dueDate: null,
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

const renderFullApp = (initialTheme = null) => {
  localStorageMock.getItem.mockReturnValue(initialTheme);
  
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

describe('Complete Theme Integration', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.removeAttribute('data-theme');
    
    // Mock successful API calls
    taskService.getAllTasks.mockResolvedValue(mockTasks);
    taskService.createTask.mockResolvedValue({
      id: 3,
      title: 'New Task',
      description: 'New Description',
      priority: 'LOW',
      completed: false,
      createdAt: new Date().toISOString()
    });
    taskService.updateTask.mockResolvedValue({
      id: 1,
      title: 'Updated Task',
      description: 'Updated Description',
      priority: 'MEDIUM',
      completed: false,
      createdAt: '2024-01-01T00:00:00.000Z'
    });
    taskService.deleteTask.mockResolvedValue();
    taskService.toggleTaskCompletion.mockResolvedValue({
      ...mockTasks[0],
      completed: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('complete light to dark theme transition', async () => {
    renderFullApp();
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Verify initial light theme
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    // Toggle to dark theme
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggle);
    
    // Verify dark theme is applied
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('taskManagerTheme', 'dark');
    
    // Verify all components still work in dark theme
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    
    // Test task interactions in dark theme
    const completeButton = screen.getAllByText('Complete')[0];
    fireEvent.click(completeButton);
    
    expect(taskService.toggleTaskCompletion).toHaveBeenCalledWith(1);
  });

  test('theme persistence across app reloads', async () => {
    // First render with dark theme saved
    renderFullApp('dark');
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Verify dark theme is loaded
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    
    // Switch to light theme
    const themeToggle = screen.getByRole('button', { name: /switch to light mode/i });
    fireEvent.click(themeToggle);
    
    // Verify light theme and persistence
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('taskManagerTheme', 'light');
  });

  test('all UI components respect theme changes', async () => {
    renderFullApp();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    // Verify all major UI elements are present in light theme
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Check task items have correct classes
    const taskItem1 = screen.getByText('Test Task 1').closest('.task-item');
    expect(taskItem1).toHaveClass('priority-high');
    
    const taskItem2 = screen.getByText('Test Task 2').closest('.task-item');
    expect(taskItem2).toHaveClass('priority-medium', 'completed');
    
    // Switch to dark theme
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggle);
    
    // Verify all elements still work in dark theme
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    
    // Test form interaction in dark theme
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Task in Dark Mode' } });
    expect(titleInput.value).toBe('New Task in Dark Mode');
  });

  test('theme toggle accessibility in complete app', async () => {
    renderFullApp();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    
    // Test keyboard navigation
    themeToggle.focus();
    expect(themeToggle).toHaveFocus();
    
    // Test keyboard activation
    fireEvent.keyDown(themeToggle, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(themeToggle, { key: 'Enter', code: 'Enter' });
    
    // Verify theme changed
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
    
    // Test space key activation
    fireEvent.keyDown(themeToggle, { key: ' ', code: 'Space' });
    fireEvent.keyUp(themeToggle, { key: ' ', code: 'Space' });
    
    // Verify theme changed back
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  test('theme system handles errors gracefully', async () => {
    // Mock localStorage error
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    renderFullApp();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Theme toggle should still work even if localStorage fails
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(themeToggle);
    
    // Theme should still change in DOM even if storage fails
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  test('responsive behavior with theme toggle', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    renderFullApp();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Theme toggle should be present and functional on mobile
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument();
    
    // Icon should be visible, text might be hidden on mobile (CSS dependent)
    expect(screen.getByText('🌙')).toBeInTheDocument();
    
    // Toggle should still work
    fireEvent.click(themeToggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});