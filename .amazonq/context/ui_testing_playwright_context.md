# Frontend UI Testing with Playwright

## Introduction

This document provides guidelines and best practices for creating effective frontend UI test automation using Playwright. It covers test design principles, implementation strategies, and recommended patterns to help QA engineers create maintainable and reliable UI tests.

## Table of Contents

1. [Playwright Fundamentals](#playwright-fundamentals)
2. [Setting Up Playwright](#setting-up-playwright)
3. [Test Design Principles](#test-design-principles)
4. [Page Object Model](#page-object-model)
5. [Test Data Management](#test-data-management)
6. [UI Interaction Patterns](#ui-interaction-patterns)
7. [Visual Testing](#visual-testing)
8. [Test Environment Management](#test-environment-management)
9. [Reporting and Documentation](#reporting-and-documentation)
10. [Continuous Integration](#continuous-integration)

## Playwright Fundamentals

### Key Features

- **Cross-browser support**: Test on Chromium, Firefox, and WebKit
- **Auto-waiting**: Automatically waits for elements to be ready
- **Network interception**: Modify and inspect network requests
- **Mobile emulation**: Test responsive designs and mobile views
- **Parallel execution**: Run tests in parallel for faster execution
- **Tracing**: Capture detailed traces for debugging
- **Video recording**: Record test execution for analysis

### Test Runners

- **Playwright Test**: Built-in test runner with parallel execution
- **Jest**: Integration with Jest for familiar testing patterns
- **pytest**: Integration with pytest for Python testing

## Setting Up Playwright

### Installation

#### JavaScript/TypeScript

```bash
# Install Playwright Test
npm init playwright@latest

# Or with specific browsers
npm init playwright@latest -- --browsers=chromium,firefox,webkit
```

#### Python

```bash
# Install Playwright
pip install playwright
pip install pytest-playwright

# Install browsers
playwright install
```

### Project Configuration

#### JavaScript/TypeScript (playwright.config.ts)

```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }]
  ],
  use: {
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5'],
      },
    },
  ],
};

export default config;
```

#### Python (pytest.ini)

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --headed --browser chromium --html=report.html
markers =
    smoke: smoke tests
    regression: regression tests
    visual: visual tests
```

## Test Design Principles

### Test Independence

- Each test should be independent and self-contained
- Tests should not depend on the state from previous tests
- Use setup and teardown for test state management

```typescript
// JavaScript/TypeScript
import { test, expect } from '@playwright/test';

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should display user information correctly', async ({ page }) => {
    await page.click('[data-testid="profile-link"]');
    await expect(page.locator('[data-testid="user-name"]')).toHaveText('Test User');
    await expect(page.locator('[data-testid="user-email"]')).toHaveText('test@example.com');
  });
});
```

```python
# Python
import pytest
from playwright.sync_api import Page, expect

class TestUserProfile:
    @pytest.fixture(autouse=True)
    def login(self, page: Page):
        # Login before each test
        page.goto("/login")
        page.fill('[data-testid="email"]', 'test@example.com')
        page.fill('[data-testid="password"]', 'password123')
        page.click('[data-testid="login-button"]')
        page.wait_for_url("/dashboard")
        
    def test_display_user_information(self, page: Page):
        page.click('[data-testid="profile-link"]')
        expect(page.locator('[data-testid="user-name"]')).to_have_text('Test User')
        expect(page.locator('[data-testid="user-email"]')).to_have_text('test@example.com')
```

### Arrange-Act-Assert Pattern

- **Arrange**: Set up the test data and navigate to the right page
- **Act**: Perform the actions being tested
- **Assert**: Verify the expected outcomes

```typescript
// JavaScript/TypeScript
test('should add item to shopping cart', async ({ page }) => {
  // Arrange
  await page.goto('/products');
  const productName = 'Test Product';
  
  // Act
  await page.click(`[data-testid="product-card"][data-name="${productName}"]`);
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="cart-icon"]');
  
  // Assert
  await expect(page.locator('[data-testid="cart-items"]')).toContainText(productName);
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});
```

```python
# Python
def test_add_item_to_shopping_cart(page: Page):
    # Arrange
    page.goto("/products")
    product_name = "Test Product"
    
    # Act
    page.click(f'[data-testid="product-card"][data-name="{product_name}"]')
    page.click('[data-testid="add-to-cart"]')
    page.click('[data-testid="cart-icon"]')
    
    # Assert
    expect(page.locator('[data-testid="cart-items"]')).to_contain_text(product_name)
    expect(page.locator('[data-testid="cart-count"]')).to_have_text("1")
```

## Page Object Model

### Basic Structure

```
ui-tests/
├── pages/                  # Page objects
│   ├── base_page.ts        # Base page with common methods
│   ├── login_page.ts       # Login page object
│   └── dashboard_page.ts   # Dashboard page object
├── components/             # Reusable component objects
│   ├── navigation.ts       # Navigation component
│   └── modal.ts            # Modal component
├── tests/                  # Test files
│   ├── auth/               # Authentication tests
│   │   └── login.spec.ts   # Login tests
│   └── dashboard/          # Dashboard tests
│       └── widgets.spec.ts # Dashboard widget tests
├── fixtures/               # Test data and fixtures
│   └── users.json          # User test data
└── utils/                  # Utility functions
    └── test_helpers.ts     # Test helper functions
```

### Page Object Implementation

#### JavaScript/TypeScript

```typescript
// pages/base_page.ts
export class BasePage {
  constructor(public page) {}
  
  async navigate(path: string) {
    await this.page.goto(path);
  }
  
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

// pages/login_page.ts
import { BasePage } from './base_page';

export class LoginPage extends BasePage {
  // Selectors
  readonly emailInput = '[data-testid="email"]';
  readonly passwordInput = '[data-testid="password"]';
  readonly loginButton = '[data-testid="login-button"]';
  readonly errorMessage = '[data-testid="error-message"]';
  
  constructor(page) {
    super(page);
  }
  
  async navigate() {
    await super.navigate('/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }
  
  async getErrorMessage() {
    return this.page.textContent(this.errorMessage);
  }
}

// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login_page';

test.describe('Login Functionality', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('valid@example.com', 'validPassword');
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('invalid@example.com', 'wrongPassword');
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid email or password');
  });
});
```

#### Python

```python
# pages/base_page.py
class BasePage:
    def __init__(self, page):
        self.page = page
    
    def navigate(self, path):
        self.page.goto(path)
    
    def wait_for_page_load(self):
        self.page.wait_for_load_state("networkidle")

# pages/login_page.py
from pages.base_page import BasePage

class LoginPage(BasePage):
    # Selectors
    EMAIL_INPUT = '[data-testid="email"]'
    PASSWORD_INPUT = '[data-testid="password"]'
    LOGIN_BUTTON = '[data-testid="login-button"]'
    ERROR_MESSAGE = '[data-testid="error-message"]'
    
    def __init__(self, page):
        super().__init__(page)
    
    def navigate(self):
        super().navigate("/login")
    
    def login(self, email, password):
        self.page.fill(self.EMAIL_INPUT, email)
        self.page.fill(self.PASSWORD_INPUT, password)
        self.page.click(self.LOGIN_BUTTON)
    
    def get_error_message(self):
        return self.page.text_content(self.ERROR_MESSAGE)

# tests/auth/test_login.py
import pytest
from playwright.sync_api import expect
from pages.login_page import LoginPage

class TestLogin:
    def test_login_with_valid_credentials(self, page):
        login_page = LoginPage(page)
        login_page.navigate()
        login_page.login("valid@example.com", "validPassword")
        page.wait_for_url("/dashboard")
        expect(page).to_have_url("/dashboard")
    
    def test_show_error_with_invalid_credentials(self, page):
        login_page = LoginPage(page)
        login_page.navigate()
        login_page.login("invalid@example.com", "wrongPassword")
        error_message = login_page.get_error_message()
        expect(error_message).to_contain("Invalid email or password")
```

## Test Data Management

### Test Data Strategies

- **Static Test Data**: Predefined data in JSON/YAML files
- **Dynamic Test Data**: Generated at runtime
- **Fixtures**: Test data provided by the test framework
- **API-Generated Data**: Data created via API calls

### Using Test Fixtures

#### JavaScript/TypeScript

```typescript
// fixtures/users.ts
import { test as base } from '@playwright/test';

export type User = {
  email: string;
  password: string;
  name: string;
  role: string;
};

export const users = {
  admin: {
    email: 'admin@example.com',
    password: 'adminPass123',
    name: 'Admin User',
    role: 'admin'
  },
  customer: {
    email: 'customer@example.com',
    password: 'customerPass123',
    name: 'Customer User',
    role: 'customer'
  }
};

// Extend the test fixture to include user data
export const test = base.extend<{ adminUser: User; customerUser: User }>({
  adminUser: async ({}, use) => {
    await use(users.admin);
  },
  customerUser: async ({}, use) => {
    await use(users.customer);
  }
});

// tests/auth/login.spec.ts
import { expect } from '@playwright/test';
import { test } from '../../fixtures/users';
import { LoginPage } from '../../pages/login_page';

test('admin should see admin dashboard', async ({ page, adminUser }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(adminUser.email, adminUser.password);
  await page.waitForURL('/admin-dashboard');
  expect(page.url()).toContain('/admin-dashboard');
});

test('customer should see customer dashboard', async ({ page, customerUser }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(customerUser.email, customerUser.password);
  await page.waitForURL('/customer-dashboard');
  expect(page.url()).toContain('/customer-dashboard');
});
```

#### Python

```python
# conftest.py
import pytest
from typing import Dict, Any

@pytest.fixture
def admin_user() -> Dict[str, Any]:
    return {
        "email": "admin@example.com",
        "password": "adminPass123",
        "name": "Admin User",
        "role": "admin"
    }

@pytest.fixture
def customer_user() -> Dict[str, Any]:
    return {
        "email": "customer@example.com",
        "password": "customerPass123",
        "name": "Customer User",
        "role": "customer"
    }

# tests/auth/test_login.py
from playwright.sync_api import expect
from pages.login_page import LoginPage

def test_admin_sees_admin_dashboard(page, admin_user):
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login(admin_user["email"], admin_user["password"])
    page.wait_for_url("/admin-dashboard")
    expect(page).to_have_url("/admin-dashboard")

def test_customer_sees_customer_dashboard(page, customer_user):
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login(customer_user["email"], customer_user["password"])
    page.wait_for_url("/customer-dashboard")
    expect(page).to_have_url("/customer-dashboard")
```

## UI Interaction Patterns

### Element Selection Strategies

- **Test IDs**: Preferred method using `data-testid` attributes
- **Accessibility Selectors**: Using roles and labels
- **CSS Selectors**: When other methods aren't available
- **Text Content**: Selecting by visible text

```typescript
// JavaScript/TypeScript
// Using test IDs (preferred)
await page.click('[data-testid="submit-button"]');

// Using accessibility selectors
await page.click('role=button[name="Submit"]');

// Using CSS selectors
await page.click('.submit-button');

// Using text content
await page.click('text=Submit');
```

```python
# Python
# Using test IDs (preferred)
page.click('[data-testid="submit-button"]')

# Using accessibility selectors
page.click('role=button[name="Submit"]')

# Using CSS selectors
page.click('.submit-button')

# Using text content
page.click('text=Submit')
```

### Waiting Strategies

- **Auto-waiting**: Playwright's built-in waiting mechanism
- **Explicit waits**: For specific conditions
- **Custom waiting**: For complex scenarios

```typescript
// JavaScript/TypeScript
// Auto-waiting (built-in)
await page.click('[data-testid="submit-button"]');
await page.fill('[data-testid="username"]', 'testuser');

// Explicit waits
await page.waitForSelector('[data-testid="results"]');
await page.waitForURL('/dashboard');
await page.waitForLoadState('networkidle');

// Custom waiting
await page.waitForFunction(() => {
  return document.querySelectorAll('.item').length > 5;
});
```

```python
# Python
# Auto-waiting (built-in)
page.click('[data-testid="submit-button"]')
page.fill('[data-testid="username"]', 'testuser')

# Explicit waits
page.wait_for_selector('[data-testid="results"]')
page.wait_for_url('/dashboard')
page.wait_for_load_state('networkidle')

# Custom waiting
page.wait_for_function("""
  () => document.querySelectorAll('.item').length > 5
""")
```

### Form Interactions

```typescript
// JavaScript/TypeScript
async function fillContactForm(page) {
  await page.fill('[data-testid="name"]', 'John Doe');
  await page.fill('[data-testid="email"]', 'john@example.com');
  await page.selectOption('[data-testid="subject"]', 'Support');
  await page.fill('[data-testid="message"]', 'This is a test message');
  await page.check('[data-testid="terms"]');
  await page.click('[data-testid="submit"]');
}
```

```python
# Python
def fill_contact_form(page):
    page.fill('[data-testid="name"]', 'John Doe')
    page.fill('[data-testid="email"]', 'john@example.com')
    page.select_option('[data-testid="subject"]', 'Support')
    page.fill('[data-testid="message"]', 'This is a test message')
    page.check('[data-testid="terms"]')
    page.click('[data-testid="submit"]')
```

## Visual Testing

### Screenshot Comparison

#### JavaScript/TypeScript

```typescript
// playwright.config.ts
export default {
  // ... other config
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
    }
  }
};

// visual.spec.ts
import { test, expect } from '@playwright/test';

test('homepage visual comparison', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

test('product card visual comparison', async ({ page }) => {
  await page.goto('/products');
  const productCard = page.locator('[data-testid="product-card"]').first();
  await expect(productCard).toHaveScreenshot('product-card.png');
});
```

#### Python

```python
# test_visual.py
from playwright.sync_api import expect

def test_homepage_visual_comparison(page):
    page.goto('/')
    expect(page).to_have_screenshot(name="homepage.png")

def test_product_card_visual_comparison(page):
    page.goto('/products')
    product_card = page.locator('[data-testid="product-card"]').first
    expect(product_card).to_have_screenshot(name="product-card.png")
```

### Visual Regression Testing

```typescript
// JavaScript/TypeScript
test.describe('Visual regression tests', () => {
  test('dashboard layout', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Mask dynamic content that changes between runs
    await page.evaluate(() => {
      const timeElements = document.querySelectorAll('.timestamp');
      timeElements.forEach(el => {
        el.style.visibility = 'hidden';
      });
    });
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      mask: [page.locator('.user-avatar')],
      fullPage: true
    });
  });
});
```

```python
# Python
class TestVisualRegression:
    def test_dashboard_layout(self, page):
        page.goto('/dashboard')
        page.wait_for_load_state('networkidle')
        
        # Mask dynamic content that changes between runs
        page.evaluate("""
          () => {
            const timeElements = document.querySelectorAll('.timestamp');
            timeElements.forEach(el => {
              el.style.visibility = 'hidden';
            });
          }
        """)
        
        expect(page).to_have_screenshot(
            name="dashboard.png",
            mask=[page.locator('.user-avatar')],
            full_page=True
        )
```

## Test Environment Management

### Environment Configuration

#### JavaScript/TypeScript

```typescript
// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    storageState: process.env.STORAGE_STATE,
  },
  projects: [
    {
      name: 'development',
      use: { 
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'staging',
      use: { 
        baseURL: 'https://staging.example.com',
      },
    },
    {
      name: 'production',
      use: { 
        baseURL: 'https://example.com',
      },
    },
  ],
};

export default config;
```

#### Python

```python
# conftest.py
import os
import pytest
from playwright.sync_api import sync_playwright

def pytest_addoption(parser):
    parser.addoption("--env", action="store", default="development", help="Environment to run tests against")

@pytest.fixture(scope="session")
def env_config(request):
    env = request.config.getoption("--env")
    if env == "production":
        return {
            "base_url": "https://example.com",
            "api_url": "https://api.example.com",
        }
    elif env == "staging":
        return {
            "base_url": "https://staging.example.com",
            "api_url": "https://staging-api.example.com",
        }
    else:  # development
        return {
            "base_url": "http://localhost:3000",
            "api_url": "http://localhost:8000",
        }

@pytest.fixture(scope="session")
def browser_context_args(env_config):
    return {
        "base_url": env_config["base_url"],
    }
```

### Authentication State Management

#### JavaScript/TypeScript

```typescript
// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
  
  // Save storage state to file
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});

// playwright.config.ts
export default {
  // ... other config
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'authenticated',
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
};

// tests/dashboard.spec.ts
import { test } from '@playwright/test';

// This test uses the authenticated state
test('authenticated user can see dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  // No need to login, we're already authenticated
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
});
```

#### Python

```python
# conftest.py
import os
import json
import pytest
from playwright.sync_api import sync_playwright

@pytest.fixture(scope="session")
def auth_state(page, env_config):
    # Login
    page.goto(f"{env_config['base_url']}/login")
    page.fill('[data-testid="email"]', 'test@example.com')
    page.fill('[data-testid="password"]', 'password123')
    page.click('[data-testid="login-button"]')
    page.wait_for_url(f"{env_config['base_url']}/dashboard")
    
    # Save storage state
    storage_state = page.context.storage_state()
    os.makedirs("playwright/.auth", exist_ok=True)
    with open("playwright/.auth/user.json", "w") as f:
        f.write(json.dumps(storage_state))
    
    return "playwright/.auth/user.json"

@pytest.fixture
def authenticated_page(browser, auth_state):
    context = browser.new_context(storage_state=auth_state)
    page = context.new_page()
    yield page
    context.close()

# tests/test_dashboard.py
def test_authenticated_user_can_see_dashboard(authenticated_page, env_config):
    authenticated_page.goto(f"{env_config['base_url']}/dashboard")
    # No need to login, we're already authenticated
    expect(authenticated_page.locator('[data-testid="welcome-message"]')).to_be_visible()
```

## Reporting and Documentation

### HTML Reports

#### JavaScript/TypeScript

```typescript
// playwright.config.ts
export default {
  // ... other config
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit-report.xml' }],
  ],
};
```

#### Python

```bash
# Run tests with HTML reporter
pytest --html=report.html
```

### Test Annotations

#### JavaScript/TypeScript

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('should login with valid credentials @smoke', async ({ page }) => {
    // Test implementation
  });
  
  test('should show error with invalid credentials @regression', async ({ page }) => {
    // Test implementation
  });
  
  test.skip('should reset password @flaky', async ({ page }) => {
    // Test implementation
  });
});
```

#### Python

```python
# tests/test_login.py
import pytest
from playwright.sync_api import expect

@pytest.mark.smoke
def test_login_with_valid_credentials(page):
    # Test implementation
    pass

@pytest.mark.regression
def test_show_error_with_invalid_credentials(page):
    # Test implementation
    pass

@pytest.mark.skip(reason="Flaky test")
def test_reset_password(page):
    # Test implementation
    pass
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install --with-deps ${{ matrix.browser }}
      
    - name: Run Playwright tests
      run: npx playwright test --project=${{ matrix.browser }}
      env:
        BASE_URL: ${{ secrets.STAGING_URL }}
        
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report-${{ matrix.browser }}
        path: |
          playwright-report/
          test-results/
```

### Python CI Example

```yaml
# .github/workflows/playwright-python.yml
name: Playwright Python Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        python-version: [3.9, 3.10]
        browser: [chromium, firefox, webkit]
        
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
        
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        
    - name: Install Playwright browsers
      run: playwright install --with-deps ${{ matrix.browser }}
      
    - name: Run Playwright tests
      run: pytest --browser ${{ matrix.browser }} --html=report.html
      env:
        BASE_URL: ${{ secrets.STAGING_URL }}
        
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-report-${{ matrix.python-version }}-${{ matrix.browser }}
        path: |
          report.html
          test-results/
```

## Best Practices Summary

1. **Use Page Object Model**: Organize tests with page objects for better maintainability
2. **Prefer Data-TestID Selectors**: Use `data-testid` attributes for stable element selection
3. **Leverage Auto-Waiting**: Take advantage of Playwright's built-in waiting mechanisms
4. **Implement Visual Testing**: Use screenshot comparisons for UI regression testing
5. **Manage Test Data Properly**: Use fixtures and generators for test data
6. **Handle Authentication Efficiently**: Reuse authentication state when possible
7. **Run Tests in Parallel**: Configure parallel execution for faster feedback
8. **Implement Cross-Browser Testing**: Test on multiple browsers to ensure compatibility
9. **Generate Detailed Reports**: Use HTML reports and test annotations
10. **Integrate with CI/CD**: Automate test execution in CI/CD pipelines
