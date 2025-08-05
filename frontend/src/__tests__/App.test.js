import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

const renderAppWithTheme = () => {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

describe('App with Theme Integration', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.removeAttribute('data-theme');
    
    // Mock successful API calls
    taskService.getAllTasks.mockResolvedValue([]);
    taskService.createTask.mockResolvedValue({ id: 1, title: 'Test Task', completed: false });
    taskService.updateTask.mockResolvedValue({ id: 1, title: 'Updated Task', completed: false });
    taskService.deleteTask.mockResolvedValue();
    taskService.toggleTaskCompletion.mockResolvedValue({ id: 1, title: 'Test Task', completed: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with theme toggle in header', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    renderAppWithTheme();
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Check that theme toggle is present
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument();
    
    // Check that the header has the correct layout
    const header = screen.getByText('Task Manager').closest('.header');
    expect(header).toBeInTheDocument();
    expect(header).toContainElement(themeToggle);
  });

  test('applies light theme by default', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    renderAppWithTheme();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Check that light theme is applied
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Check theme toggle shows dark mode option
    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  test('applies saved dark theme from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    renderAppWithTheme();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Check that dark theme is applied
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    // Check theme toggle shows light mode option
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  test('maintains existing functionality with theme integration', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    renderAppWithTheme();
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Check that all main components are still rendered
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument(); // Filter tabs
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Check that task service was called
    expect(taskService.getAllTasks).toHaveBeenCalled();
  });

  test('handles API errors gracefully with theme', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    taskService.getAllTasks.mockRejectedValue(new Error('API Error'));
    
    renderAppWithTheme();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks. Please try again later.')).toBeInTheDocument();
    });
    
    // Theme toggle should still work even with API errors
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument();
  });

  test('responsive design works with theme toggle', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    renderAppWithTheme();
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
    
    // Theme toggle should still be present on mobile
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeToggle).toBeInTheDocument();
  });
});