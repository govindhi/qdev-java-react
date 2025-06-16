# React Coding Standards and Best Practices (2025)

## Introduction

This document outlines recommended coding standards and best practices for modern React development. Following these guidelines will help ensure code consistency, readability, and maintainability across projects while leveraging the latest React features and patterns.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Organization](#component-organization)
3. [Hooks](#hooks)
4. [State Management](#state-management)
5. [TypeScript Integration](#typescript-integration)
6. [Styling Approaches](#styling-approaches)
7. [Performance Optimization](#performance-optimization)
8. [Testing](#testing)
9. [Accessibility](#accessibility)
10. [Code Formatting and Linting](#code-formatting-and-linting)
11. [Security Best Practices](#security-best-practices)
12. [Tools and Libraries](#tools-and-libraries)
13. [Additional Resources](#additional-resources)

## Project Structure

### Recommended Structure

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
├── lib/                 # Third-party library configurations
├── pages/               # Page components (for routing)
├── services/            # API services and external integrations
├── store/               # Global state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx              # Root component
```

### Best Practices

- Group related files by feature or domain rather than by file type
- Keep components small and focused on a single responsibility
- Use barrel files (`index.ts`) to simplify imports
- Maintain a clear separation between UI components and business logic

## Component Organization

### Functional Components

Use functional components with hooks instead of class components:

```jsx
// Good
function UserProfile({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Avoid
class UserProfile extends React.Component {
  render() {
    const { user } = this.props;
    return (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }
}
```

### Component File Structure

Each component should follow a consistent structure:

```jsx
// 1. Imports
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledButton } from './Button.styles';

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
    <StyledButton 
      variant={variant} 
      disabled={disabled} 
      onClick={handleClick}
    >
      {t(label)}
    </StyledButton>
  );
}

// 7. Default exports
export default Button;
```

### Component Naming

- Use PascalCase for component names
- Use descriptive names that reflect the component's purpose
- Suffix test files with `.test.tsx` or `.spec.tsx`
- Suffix style files based on the styling solution (e.g., `.styles.ts` for styled-components)

```
Button.tsx
Button.test.tsx
Button.styles.ts
```

## Hooks

### Custom Hooks

- Prefix custom hook names with `use`
- Extract complex logic into custom hooks
- Keep hooks focused on a single concern

```jsx
// Good
function useUserData(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await api.getUser(userId);
        setUser(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { user, loading, error } = useUserData(userId);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <UserDetails user={user} />;
}
```

### Hook Rules

- Follow the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html):
  - Only call hooks at the top level
  - Only call hooks from React functions
- Always include all dependencies in the dependency array
- Use the ESLint plugin `eslint-plugin-react-hooks` to enforce these rules

### Common Hooks Best Practices

- **useState**: Use multiple state variables for unrelated state
- **useEffect**: Keep effects focused on a single concern
- **useCallback**: Use for functions passed to child components
- **useMemo**: Use for expensive calculations
- **useRef**: Use for accessing DOM elements or storing mutable values
- **useContext**: Use for global state that changes infrequently

```jsx
// Good - separate state variables
const [name, setName] = useState('');
const [age, setAge] = useState(0);

// Avoid - object state for unrelated values
const [user, setUser] = useState({ name: '', age: 0 });
```

## State Management

### Local vs. Global State

- Use local state (useState) for component-specific state
- Use context (useContext) for state shared between related components
- Use global state management for application-wide state

### State Management Options

#### React Context + useReducer

For medium-sized applications or when state changes are infrequent:

```jsx
// store/UserContext.tsx
import React, { createContext, useReducer, useContext } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type UserState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};

type UserAction = 
  | { type: 'FETCH_USER_REQUEST' }
  | { type: 'FETCH_USER_SUCCESS'; payload: User }
  | { type: 'FETCH_USER_FAILURE'; payload: Error };

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'FETCH_USER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_USER_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'FETCH_USER_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
}>({ state: initialState, dispatch: () => null });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
```

#### Redux Toolkit

For larger applications with complex state:

```jsx
// store/userSlice.ts
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
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.user = null;
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
        state.user = action.payload;
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

#### Zustand

For a simpler alternative to Redux:

```jsx
// store/useUserStore.ts
import create from 'zustand';
import { api } from '../services/api';

type UserStore = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  fetchUser: (userId: string) => Promise<void>;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (userId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getUser(userId);
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  clearUser: () => set({ user: null }),
}));
```

### Best Practices

- Choose the simplest state management solution for your needs
- Avoid prop drilling by using context or global state
- Keep state as close as possible to where it's used
- Use immutable state updates
- Normalize complex state structures

## TypeScript Integration

### Basic Types

```tsx
// Basic prop types
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
};

// Function component with TypeScript
const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
      {children}
    </button>
  );
};
```

### Event Handling

```tsx
// Event handling with TypeScript
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Form submission logic
};
```

### Generic Components

```tsx
// Generic components
type SelectProps<T> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
};

function Select<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
}: SelectProps<T>) {
  return (
    <select
      value={getOptionValue(value)}
      onChange={(e) => {
        const selectedOption = options.find(
          (option) => getOptionValue(option).toString() === e.target.value
        );
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
    >
      {options.map((option) => (
        <option key={getOptionValue(option)} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

### Best Practices

- Use TypeScript for all new React projects
- Define explicit types for props, state, and context
- Use interfaces for public APIs and types for internal implementations
- Leverage union types for props with a finite set of options
- Use generics for reusable components
- Avoid using `any` type
- Use type assertions sparingly

## Styling Approaches

### CSS Modules

```tsx
// Button.module.css
.button {
  padding: 8px 16px;
  border-radius: 4px;
}

.primary {
  background-color: blue;
  color: white;
}

.secondary {
  background-color: gray;
  color: black;
}

// Button.tsx
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  // other props
};

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`} 
      {...props} 
    />
  );
}
```

### Styled Components

```tsx
// Button.styles.ts
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary';

type StyledButtonProps = {
  variant: ButtonVariant;
  size?: 'small' | 'medium' | 'large';
};

export const StyledButton = styled.button<StyledButtonProps>`
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          padding: 4px 8px;
          font-size: 12px;
        `;
      case 'large':
        return css`
          padding: 12px 24px;
          font-size: 18px;
        `;
      default:
        return css`
          padding: 8px 16px;
          font-size: 14px;
        `;
    }
  }}
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: #0070f3;
          color: white;
          &:hover {
            background-color: #0060df;
          }
        `;
      case 'secondary':
        return css`
          background-color: #f5f5f5;
          color: #333;
          &:hover {
            background-color: #e5e5e5;
          }
        `;
      default:
        return '';
    }
  }}
`;

// Button.tsx
import { StyledButton } from './Button.styles';

export function Button({ variant = 'primary', size = 'medium', ...props }) {
  return <StyledButton variant={variant} size={size} {...props} />;
}
```

### Tailwind CSS

```tsx
// Button.tsx with Tailwind CSS
type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  // other props
};

export function Button({ 
  variant = 'primary', 
  size = 'medium',
  children,
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
```

### Best Practices

- Choose a styling approach based on team preferences and project requirements
- Maintain consistency with the chosen approach throughout the project
- Use a design system or component library for consistent UI
- Consider responsive design from the start
- Use CSS variables for theming
- Avoid inline styles except for dynamic values that can't be handled otherwise

## Performance Optimization

### Memoization

```jsx
// Memoize expensive components
const MemoizedComponent = React.memo(ExpensiveComponent);

// Memoize expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Memoize callbacks
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Code Splitting

```jsx
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

### Virtualization

```jsx
// Using react-window for virtualized lists
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Best Practices

- Use the React DevTools Profiler to identify performance bottlenecks
- Implement memoization judiciously
- Use code splitting for large applications
- Implement virtualization for long lists
- Optimize images and assets
- Use web workers for CPU-intensive tasks
- Implement proper loading states and skeleton screens

## Testing

### Component Testing

```jsx
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

```jsx
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  test('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  test('should decrement counter', () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(9);
  });
});
```

### Integration Testing

```jsx
// UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { UserProfile } from './UserProfile';

const server = setupServer(
  rest.get('/api/user/1', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays user data', async () => {
  render(<UserProfile userId="1" />);
  
  // Should show loading state initially
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for the user data to load
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

### Best Practices

- Write tests for all components and hooks
- Focus on testing behavior, not implementation details
- Use React Testing Library for component tests
- Use MSW (Mock Service Worker) for API mocking
- Implement both unit and integration tests
- Aim for high test coverage, but prioritize critical paths
- Run tests as part of CI/CD pipeline

## Accessibility

### ARIA Attributes

```jsx
// Accessible dropdown menu
function Dropdown({ label, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  
  const handleSelect = (option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };
  
  return (
    <div 
      ref={dropdownRef}
      className="dropdown"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-labelledby="dropdown-label"
    >
      <span id="dropdown-label">{label}</span>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {selectedOption ? selectedOption.label : 'Select an option'}
      </button>
      
      {isOpen && (
        <ul role="listbox">
          {options.map((option) => (
            <li 
              key={option.value}
              role="option"
              aria-selected={selectedOption?.value === option.value}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Keyboard Navigation

```jsx
// Keyboard navigation for a menu
function Menu({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        items[activeIndex].onClick();
        break;
      default:
        break;
    }
  };
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li 
          key={item.id}
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
          aria-current={index === activeIndex}
          onClick={item.onClick}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Best Practices

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation for all interactive elements
- Maintain sufficient color contrast
- Provide text alternatives for non-text content
- Test with screen readers
- Use tools like axe or Lighthouse for accessibility audits
- Follow the [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)

## Code Formatting and Linting

### ESLint Configuration

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
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Use TypeScript for prop validation
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Prettier Configuration

```js
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'auto',
  arrowParens: 'avoid',
};
```

### Best Practices

- Use ESLint for code quality and error prevention
- Use Prettier for consistent code formatting
- Configure pre-commit hooks with Husky and lint-staged
- Integrate linting into the CI/CD pipeline
- Maintain a consistent coding style across the team
- Address all linting warnings and errors

## Security Best Practices

### XSS Prevention

```jsx
// Sanitize HTML content
import DOMPurify from 'dompurify';

function Comment({ content }) {
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
```

### Secure Data Handling

```jsx
// Avoid exposing sensitive data
function UserProfile({ user }) {
  // Don't include sensitive data in the component state or props
  const { name, email, role } = user;
  
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      <p>Role: {role}</p>
      {/* Don't render sensitive data like tokens, passwords, etc. */}
    </div>
  );
}
```

### Best Practices

- Sanitize any HTML rendered with `dangerouslySetInnerHTML`
- Validate and sanitize all user inputs
- Use HTTPS for all API requests
- Implement proper authentication and authorization
- Don't store sensitive information in local storage
- Keep dependencies updated
- Use Content Security Policy (CSP)
- Implement proper error handling to avoid leaking sensitive information

## Tools and Libraries

### Recommended Tools

- **Create React App** or **Vite**: Project scaffolding
- **TypeScript**: Static type checking
- **ESLint** and **Prettier**: Code quality and formatting
- **Jest** and **React Testing Library**: Testing
- **Storybook**: Component development and documentation
- **Cypress** or **Playwright**: End-to-end testing

### Recommended Libraries

- **React Router**: Routing
- **React Query** or **SWR**: Data fetching
- **Redux Toolkit** or **Zustand**: State management
- **Styled Components**, **Emotion**, or **Tailwind CSS**: Styling
- **React Hook Form**: Form handling
- **Zod** or **Yup**: Schema validation
- **date-fns** or **Day.js**: Date manipulation
- **React Helmet**: Document head management
- **Framer Motion**: Animations

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Patterns](https://reactpatterns.com/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [React Security Handbook](https://github.com/0xlucipher/React-Security-Handbook)
- [A11y Coffee](https://a11y.coffee/)
- [Web.dev React](https://web.dev/react)

## Conclusion

Following these guidelines will help you write clean, maintainable, and performant React applications. Remember that consistency is key - it's more important to be consistent within a project than to follow every guideline perfectly. When working on existing projects, follow the established style of that codebase.

These standards should evolve over time as React and its ecosystem continue to develop. Regularly review and update your practices to incorporate new best practices and patterns.
