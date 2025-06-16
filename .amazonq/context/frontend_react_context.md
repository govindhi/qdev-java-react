# Frontend React Development Context

## Overview

This document provides context for frontend React development, focusing on best practices, coding standards, and modern patterns used in our projects. It serves as a reference guide for both new and experienced React developers to maintain consistency and quality across our frontend codebases.

## Project Structure

We follow a feature-based organization for our React applications:

```
src/
├── assets/              # Static assets (images, fonts, etc.)
├── components/          # Shared/reusable components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   └── layout/          # Layout components (Header, Footer, etc.)
├── features/            # Feature-based modules
│   └── feature-name/    # Specific feature
│       ├── api/         # API integration for this feature
│       ├── components/  # Feature-specific components
│       ├── hooks/       # Feature-specific hooks
│       ├── utils/       # Feature-specific utilities
│       └── index.ts     # Public API for the feature
├── hooks/               # Shared custom hooks
├── pages/               # Page components (for routing)
├── services/            # API services and external integrations
├── store/               # Global state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx              # Root component
```

### Key Principles:

- Group related files by feature or domain rather than by file type
- Keep components small and focused on a single responsibility
- Use barrel files (`index.ts`) to simplify imports
- Maintain a clear separation between UI components and business logic

## Component Development

### Component Structure

All components should follow this consistent structure:

```tsx
// 1. Imports
import React from 'react';
import { useTranslation } from 'react-i18next';

// 2. Type definitions
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

// 3. Component definition
export function Button({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  // 4. Hooks
  const { t } = useTranslation();
  
  // 5. Derived state and handlers
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };
  
  // 6. Render
  return (
    <button 
      className={`btn btn-${variant}`}
      disabled={disabled} 
      onClick={handleClick}
    >
      {t(label)}
    </button>
  );
}

// 7. Default export
export default Button;
```

### Component Best Practices

- Use functional components with hooks instead of class components
- Keep components focused on a single responsibility
- Use PascalCase for component names and files
- Extract complex logic into custom hooks
- Use TypeScript for type safety
- Implement proper prop validation
- Provide default values for optional props
- Use destructuring for props and state
- Avoid inline styles except for dynamic values

### File Naming Conventions

- Component files: `ComponentName.tsx`
- Test files: `ComponentName.test.tsx` or `ComponentName.spec.tsx`
- Style files: `ComponentName.module.css` or `ComponentName.styles.ts`
- Hook files: `useHookName.ts`
- Utility files: `descriptiveName.ts`

## Hooks Usage

### Custom Hooks

Extract reusable logic into custom hooks:

```tsx
// useUserData.ts
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useUserData(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await api.getUser(userId);
        if (isMounted) {
          setUser(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { user, loading, error };
}
```

### Hook Guidelines

- Prefix custom hook names with `use`
- Keep hooks focused on a single concern
- Follow the Rules of Hooks:
  - Only call hooks at the top level
  - Only call hooks from React functions
- Include all dependencies in the dependency array
- Use the ESLint plugin `eslint-plugin-react-hooks` to enforce these rules
- Implement cleanup functions in useEffect when necessary

## State Management

We use different state management approaches based on the complexity of the application:

### Local State

For component-specific state:

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Context API

For state shared between related components:

```tsx
// ThemeContext.tsx
import React, { createContext, useState, useContext } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### Redux Toolkit

For complex global state:

```tsx
// userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await api.getUser(userId);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### State Management Guidelines

- Choose the simplest state management solution for your needs
- Use local state for component-specific state
- Use Context API for state shared between related components
- Use Redux Toolkit for complex global state
- Keep state as close as possible to where it's used
- Use immutable state updates
- Normalize complex state structures

## TypeScript Integration

We use TypeScript for all React projects to ensure type safety and improve developer experience:

### Props and State Types

```tsx
// Define prop types
type UserProfileProps = {
  userId: string;
  showDetails: boolean;
  onUpdate?: (user: User) => void;
};

// Define state types
type UserState = {
  data: User | null;
  loading: boolean;
  error: Error | null;
};

// Use with useState
const [userState, setUserState] = useState<UserState>({
  data: null,
  loading: false,
  error: null,
});
```

### Event Handling

```tsx
// Form event handling
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Form submission logic
};

// Input event handling
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setName(event.target.value);
};

// Button click handling
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Click handling logic
};
```

### TypeScript Best Practices

- Define explicit types for props, state, and context
- Use interfaces for public APIs and types for internal implementations
- Leverage union types for props with a finite set of options
- Use generics for reusable components and hooks
- Avoid using `any` type
- Use type assertions sparingly
- Utilize TypeScript's utility types (Partial, Pick, Omit, etc.)

## Styling Approach

We use a consistent styling approach across our projects. Currently, we use:

### CSS Modules

```tsx
// Button.module.css
.button {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

.primary {
  background-color: var(--primary-color);
  color: white;
}

.secondary {
  background-color: var(--secondary-color);
  color: var(--text-color);
}

// Button.tsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`} 
      {...props}
    >
      {children}
    </button>
  );
}
```

### Styling Guidelines

- Use CSS variables for theming and consistent values
- Follow a component-based styling approach
- Implement responsive design using media queries
- Use a consistent naming convention for CSS classes
- Avoid inline styles except for dynamic values
- Consider accessibility in your styling (contrast, focus states, etc.)

## Performance Optimization

### Memoization

```tsx
// Memoize expensive components
const MemoizedComponent = React.memo(ExpensiveComponent);

// Memoize expensive calculations
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// Memoize callbacks
const handleClick = useCallback(() => {
  console.log('Button clicked!', data);
}, [data]);
```

### Code Splitting

```tsx
// Route-based code splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Performance Guidelines

- Use the React DevTools Profiler to identify performance bottlenecks
- Implement memoization for expensive components and calculations
- Use code splitting for large applications
- Implement virtualization for long lists
- Optimize images and assets
- Use web workers for CPU-intensive tasks
- Implement proper loading states and skeleton screens

## Testing

We follow a comprehensive testing strategy for our React applications:

### Component Testing

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Hook Testing

```tsx
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Guidelines

- Write tests for all components and hooks
- Focus on testing behavior, not implementation details
- Use React Testing Library for component tests
- Use MSW (Mock Service Worker) for API mocking
- Implement both unit and integration tests
- Aim for high test coverage, but prioritize critical paths
- Run tests as part of CI/CD pipeline

## Accessibility

We prioritize accessibility in all our React applications:

### Accessibility Guidelines

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation for all interactive elements
- Maintain sufficient color contrast
- Provide text alternatives for non-text content
- Test with screen readers
- Use tools like axe or Lighthouse for accessibility audits

### Example: Accessible Button

```tsx
function AccessibleButton({ 
  onClick, 
  disabled = false, 
  ariaLabel, 
  children 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || undefined}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## Code Quality Tools

We use the following tools to maintain code quality:

### ESLint Configuration

We use ESLint to enforce coding standards and catch potential issues:

```js
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier Configuration

We use Prettier for consistent code formatting:

```js
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'auto',
};
```

## Security Best Practices

We follow these security best practices in our React applications:

- Sanitize any HTML rendered with `dangerouslySetInnerHTML`
- Validate and sanitize all user inputs
- Use HTTPS for all API requests
- Implement proper authentication and authorization
- Don't store sensitive information in local storage
- Keep dependencies updated
- Use Content Security Policy (CSP)
- Implement proper error handling

## Recommended Libraries

These are the libraries we commonly use in our React projects:

- **React Router**: For routing
- **React Query** or **SWR**: For data fetching
- **Redux Toolkit** or **Zustand**: For state management
- **React Hook Form**: For form handling
- **Zod** or **Yup**: For schema validation
- **date-fns**: For date manipulation
- **React Helmet**: For document head management
- **Framer Motion**: For animations

## Development Workflow

1. **Feature Planning**: Understand requirements and plan implementation
2. **Component Design**: Design components and their interactions
3. **Implementation**: Write code following our standards and best practices
4. **Testing**: Write unit and integration tests
5. **Code Review**: Submit for peer review
6. **Refinement**: Address feedback and make improvements
7. **Documentation**: Update documentation as needed
8. **Deployment**: Deploy to staging/production environments

## Conclusion

Following these guidelines will help ensure that our React applications are consistent, maintainable, and high-quality. Remember that these standards should evolve over time as React and its ecosystem continue to develop.

For more detailed information, refer to the following resources:
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
