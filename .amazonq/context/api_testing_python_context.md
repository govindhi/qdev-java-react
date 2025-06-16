# API Functional Testing in Python

## Introduction

This document provides a comprehensive guide for creating effective API functional tests using Python. It covers test design principles, implementation strategies, and recommended frameworks to help QA engineers create maintainable and reliable API test suites.

## Table of Contents

1. [Testing Framework Overview](#testing-framework-overview)
2. [Project Structure](#project-structure)
3. [Test Design Patterns](#test-design-patterns)
4. [API Client Implementation](#api-client-implementation)
5. [Test Data Management](#test-data-management)
6. [Authentication Handling](#authentication-handling)
7. [Response Validation](#response-validation)
8. [Test Environment Configuration](#test-environment-configuration)
9. [Test Execution and Reporting](#test-execution-and-reporting)
10. [Continuous Integration](#continuous-integration)

## Testing Framework Overview

### Recommended Stack

- **pytest**: Core testing framework
- **requests**: HTTP library for API calls
- **pytest-xdist**: Parallel test execution
- **jsonschema/pydantic**: Response validation
- **pytest-html**: HTML report generation
- **allure-pytest**: Advanced reporting

### Installation

```bash
pip install pytest requests pytest-xdist jsonschema pydantic pytest-html allure-pytest
```

## Project Structure

```
api-tests/
├── conftest.py              # Shared fixtures and hooks
├── pytest.ini              # pytest configuration
├── requirements.txt        # Dependencies
├── config/
│   ├── __init__.py
│   ├── settings.py         # Configuration settings
│   └── environments.py     # Environment-specific settings
├── api/
│   ├── __init__.py
│   ├── base_client.py      # Base API client
│   ├── users_api.py        # User-related endpoints
│   └── products_api.py     # Product-related endpoints
├── schemas/
│   ├── __init__.py
│   ├── users.py            # User response schemas
│   └── products.py         # Product response schemas
├── data/
│   ├── __init__.py
│   ├── users.py            # User test data
│   └── products.py         # Product test data
├── tests/
│   ├── __init__.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── test_get_users.py
│   │   └── test_create_user.py
│   └── products/
│       ├── __init__.py
│       ├── test_get_products.py
│       └── test_create_product.py
└── utils/
    ├── __init__.py
    ├── data_generator.py   # Test data generation
    └── validators.py       # Custom validators
```

## Test Design Patterns

### Arrange-Act-Assert Pattern

```python
def test_create_user_success():
    # Arrange
    user_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user"
    }
    
    # Act
    response = users_api.create_user(user_data)
    
    # Assert
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["name"] == user_data["name"]
    assert response.json()["email"] == user_data["email"]
```

### Parameterized Tests

```python
import pytest

@pytest.mark.parametrize("role,expected_status", [
    ("admin", 200),
    ("user", 200),
    ("guest", 403),
    (None, 401)
])
def test_get_users_with_different_roles(role, expected_status):
    # Arrange
    headers = {"Authorization": f"Bearer {get_token_for_role(role)}"} if role else {}
    
    # Act
    response = users_api.get_users(headers=headers)
    
    # Assert
    assert response.status_code == expected_status
```

### Test Independence

```python
import pytest

@pytest.fixture
def created_user():
    # Setup: Create a test user
    user_data = {
        "name": "Test User",
        "email": f"test.user.{uuid.uuid4()}@example.com",
        "role": "user"
    }
    response = users_api.create_user(user_data)
    user_id = response.json()["id"]
    
    yield {"id": user_id, **user_data}
    
    # Teardown: Delete the test user
    users_api.delete_user(user_id)

def test_get_user_by_id(created_user):
    # Act
    response = users_api.get_user(created_user["id"])
    
    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == created_user["id"]
    assert response.json()["name"] == created_user["name"]
    assert response.json()["email"] == created_user["email"]
```

## API Client Implementation

### Base API Client

```python
# api/base_client.py
import requests
from config.settings import get_settings

class BaseApiClient:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.api_base_url
        self.timeout = self.settings.request_timeout
    
    def _get_headers(self, additional_headers=None):
        """Get default headers with optional additions."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        if additional_headers:
            headers.update(additional_headers)
        
        return headers
    
    def get(self, endpoint, params=None, headers=None):
        """Send GET request to API endpoint."""
        url = f"{self.base_url}{endpoint}"
        return requests.get(
            url,
            params=params,
            headers=self._get_headers(headers),
            timeout=self.timeout
        )
    
    def post(self, endpoint, data=None, json=None, headers=None):
        """Send POST request to API endpoint."""
        url = f"{self.base_url}{endpoint}"
        return requests.post(
            url,
            data=data,
            json=json,
            headers=self._get_headers(headers),
            timeout=self.timeout
        )
    
    def put(self, endpoint, data=None, json=None, headers=None):
        """Send PUT request to API endpoint."""
        url = f"{self.base_url}{endpoint}"
        return requests.put(
            url,
            data=data,
            json=json,
            headers=self._get_headers(headers),
            timeout=self.timeout
        )
    
    def patch(self, endpoint, data=None, json=None, headers=None):
        """Send PATCH request to API endpoint."""
        url = f"{self.base_url}{endpoint}"
        return requests.patch(
            url,
            data=data,
            json=json,
            headers=self._get_headers(headers),
            timeout=self.timeout
        )
    
    def delete(self, endpoint, headers=None):
        """Send DELETE request to API endpoint."""
        url = f"{self.base_url}{endpoint}"
        return requests.delete(
            url,
            headers=self._get_headers(headers),
            timeout=self.timeout
        )
```

### Specific API Clients

```python
# api/users_api.py
from api.base_client import BaseApiClient

class UsersApi(BaseApiClient):
    def get_users(self, params=None, headers=None):
        """Get all users."""
        return self.get("/users", params=params, headers=headers)
    
    def get_user(self, user_id, headers=None):
        """Get user by ID."""
        return self.get(f"/users/{user_id}", headers=headers)
    
    def create_user(self, user_data, headers=None):
        """Create a new user."""
        return self.post("/users", json=user_data, headers=headers)
    
    def update_user(self, user_id, user_data, headers=None):
        """Update an existing user."""
        return self.put(f"/users/{user_id}", json=user_data, headers=headers)
    
    def patch_user(self, user_id, user_data, headers=None):
        """Partially update an existing user."""
        return self.patch(f"/users/{user_id}", json=user_data, headers=headers)
    
    def delete_user(self, user_id, headers=None):
        """Delete a user."""
        return self.delete(f"/users/{user_id}", headers=headers)

# Usage
users_api = UsersApi()
```

## Test Data Management

### Test Data Generation

```python
# utils/data_generator.py
import random
import uuid
from faker import Faker

fake = Faker()

def generate_user(overrides=None):
    """Generate random user data."""
    user = {
        "name": fake.name(),
        "email": fake.email(),
        "role": random.choice(["admin", "user", "editor"]),
        "active": True
    }
    
    if overrides:
        user.update(overrides)
    
    return user

def generate_product(overrides=None):
    """Generate random product data."""
    product = {
        "name": fake.catch_phrase(),
        "price": round(random.uniform(10, 1000), 2),
        "description": fake.paragraph(),
        "category": random.choice(["Electronics", "Clothing", "Books", "Home"]),
        "in_stock": random.choice([True, False])
    }
    
    if overrides:
        product.update(overrides)
    
    return product
```

### Test Data Fixtures

```python
# conftest.py
import pytest
import uuid
from utils.data_generator import generate_user, generate_product
from api.users_api import UsersApi
from api.products_api import ProductsApi

users_api = UsersApi()
products_api = ProductsApi()

@pytest.fixture
def random_user_data():
    """Generate random user data."""
    return generate_user()

@pytest.fixture
def random_product_data():
    """Generate random product data."""
    return generate_product()

@pytest.fixture
def created_user():
    """Create a test user and return the user data and ID."""
    user_data = generate_user({"email": f"test.user.{uuid.uuid4()}@example.com"})
    response = users_api.create_user(user_data)
    user_id = response.json()["id"]
    
    yield {"id": user_id, **user_data}
    
    # Cleanup
    users_api.delete_user(user_id)

@pytest.fixture
def created_product():
    """Create a test product and return the product data and ID."""
    product_data = generate_product()
    response = products_api.create_product(product_data)
    product_id = response.json()["id"]
    
    yield {"id": product_id, **product_data}
    
    # Cleanup
    products_api.delete_product(product_id)
```

## Authentication Handling

### Token Management

```python
# api/auth.py
import time
import requests
from config.settings import get_settings

settings = get_settings()

# Token cache
_token_cache = {
    "access_token": None,
    "expires_at": 0
}

def get_auth_token(force_refresh=False):
    """Get a valid authentication token, refreshing if necessary."""
    global _token_cache
    
    current_time = time.time()
    
    # Return cached token if still valid and not forcing refresh
    if not force_refresh and _token_cache["access_token"] and current_time < _token_cache["expires_at"]:
        return _token_cache["access_token"]
    
    # Get new token
    auth_data = {
        "client_id": settings.auth_client_id,
        "client_secret": settings.auth_client_secret,
        "grant_type": "client_credentials"
    }
    
    response = requests.post(
        f"{settings.auth_url}/token",
        json=auth_data,
        headers={"Content-Type": "application/json"}
    )
    
    response.raise_for_status()
    token_data = response.json()
    
    _token_cache["access_token"] = token_data["access_token"]
    # Set expiry time (subtract buffer to ensure token is still valid when used)
    _token_cache["expires_at"] = current_time + token_data["expires_in"] - 30
    
    return _token_cache["access_token"]

def get_auth_header():
    """Get authorization header with bearer token."""
    token = get_auth_token()
    return {"Authorization": f"Bearer {token}"}
```

### Authentication Fixtures

```python
# conftest.py
import pytest
from api.auth import get_auth_token, get_auth_header

@pytest.fixture
def auth_token():
    """Get authentication token."""
    return get_auth_token()

@pytest.fixture
def auth_headers():
    """Get headers with authentication token."""
    return get_auth_header()

@pytest.fixture
def admin_auth_headers():
    """Get headers with admin authentication token."""
    # Implementation depends on your authentication system
    admin_token = get_admin_token()
    return {"Authorization": f"Bearer {admin_token}"}
```

## Response Validation

### JSON Schema Validation

```python
# schemas/users.py
user_schema = {
    "type": "object",
    "required": ["id", "name", "email", "role"],
    "properties": {
        "id": {"type": "string", "format": "uuid"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "role": {"type": "string", "enum": ["admin", "user", "editor"]},
        "active": {"type": "boolean"}
    }
}

users_list_schema = {
    "type": "array",
    "items": user_schema
}

# utils/validators.py
import jsonschema
from jsonschema import validate
from schemas.users import user_schema, users_list_schema
from schemas.products import product_schema, products_list_schema

def validate_schema(instance, schema):
    """Validate data against JSON schema."""
    try:
        validate(instance=instance, schema=schema)
        return True
    except jsonschema.exceptions.ValidationError as e:
        raise AssertionError(f"Schema validation failed: {e}")

def validate_user(user_data):
    """Validate user data against user schema."""
    return validate_schema(user_data, user_schema)

def validate_users_list(users_data):
    """Validate users list data against users list schema."""
    return validate_schema(users_data, users_list_schema)

def validate_product(product_data):
    """Validate product data against product schema."""
    return validate_schema(product_data, product_schema)

def validate_products_list(products_data):
    """Validate products list data against products list schema."""
    return validate_schema(products_data, products_list_schema)
```

### Pydantic Models

```python
# schemas/pydantic_models.py
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from enum import Enum
from uuid import UUID

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    EDITOR = "editor"

class User(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    active: Optional[bool] = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.USER
    active: Optional[bool] = True

class UserList(BaseModel):
    __root__: List[User]

# utils/pydantic_validators.py
from schemas.pydantic_models import User, UserList

def validate_user_pydantic(user_data):
    """Validate user data using Pydantic model."""
    try:
        User(**user_data)
        return True
    except Exception as e:
        raise AssertionError(f"User validation failed: {e}")

def validate_users_list_pydantic(users_data):
    """Validate users list data using Pydantic model."""
    try:
        UserList(__root__=users_data)
        return True
    except Exception as e:
        raise AssertionError(f"Users list validation failed: {e}")
```

## Test Environment Configuration

### Settings Management

```python
# config/settings.py
import os
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    """Application settings."""
    # API settings
    api_base_url: str
    auth_url: str
    auth_client_id: str
    auth_client_secret: str
    
    # Request settings
    request_timeout: int = 30
    verify_ssl: bool = True
    
    class Config:
        env_file = ".env"

def get_settings():
    """Get settings for the current environment."""
    env = os.getenv("TEST_ENV", "development")
    
    if env == "production":
        return Settings(
            api_base_url="https://api.example.com/v1",
            auth_url="https://auth.example.com",
            auth_client_id=os.getenv("PROD_CLIENT_ID"),
            auth_client_secret=os.getenv("PROD_CLIENT_SECRET"),
        )
    elif env == "staging":
        return Settings(
            api_base_url="https://staging-api.example.com/v1",
            auth_url="https://staging-auth.example.com",
            auth_client_id=os.getenv("STAGING_CLIENT_ID"),
            auth_client_secret=os.getenv("STAGING_CLIENT_SECRET"),
        )
    else:  # development
        return Settings(
            api_base_url="http://localhost:8000/api/v1",
            auth_url="http://localhost:8000/auth",
            auth_client_id="test-client",
            auth_client_secret="test-secret",
        )
```

### Environment Variables

Example `.env` file:
```
TEST_ENV=development
STAGING_CLIENT_ID=staging-client-id
STAGING_CLIENT_SECRET=staging-client-secret
PROD_CLIENT_ID=prod-client-id
PROD_CLIENT_SECRET=prod-client-secret
```

## Test Execution and Reporting

### pytest Configuration

```python
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --verbose --html=report.html --self-contained-html
markers =
    smoke: smoke tests
    regression: regression tests
    integration: integration tests
```

### Test Markers

```python
# tests/users/test_get_users.py
import pytest
from utils.validators import validate_users_list

@pytest.mark.smoke
def test_get_all_users(auth_headers):
    """Test retrieving all users returns 200 and valid user list."""
    response = users_api.get_users(headers=auth_headers)
    
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    validate_users_list(users)

@pytest.mark.regression
def test_get_users_with_filter(auth_headers):
    """Test filtering users by role."""
    role = "admin"
    response = users_api.get_users(params={"role": role}, headers=auth_headers)
    
    assert response.status_code == 200
    users = response.json()
    assert all(user["role"] == role for user in users)
```

### HTML Reports

```python
# conftest.py
import pytest
from datetime import datetime

@pytest.hookimpl(tryfirst=True)
def pytest_configure(config):
    """Set up the HTML report with additional metadata."""
    config._metadata["Project"] = "API Testing"
    config._metadata["Tester"] = "QA Team"
    config._metadata["Environment"] = os.getenv("TEST_ENV", "development")
    config._metadata["Timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def pytest_html_report_title(report):
    """Set the title of the HTML report."""
    report.title = "API Test Report"
```

### Allure Reports

```python
# tests/users/test_create_user.py
import allure
import pytest
from utils.data_generator import generate_user
from utils.validators import validate_user

@allure.feature("User Management")
@allure.story("User Creation")
def test_create_user_success(auth_headers, random_user_data):
    """Test creating a new user with valid data."""
    with allure.step("Send POST request to create user"):
        response = users_api.create_user(random_user_data, headers=auth_headers)
    
    with allure.step("Verify response status code is 201"):
        assert response.status_code == 201
    
    with allure.step("Verify user data in response"):
        user = response.json()
        assert user["name"] == random_user_data["name"]
        assert user["email"] == random_user_data["email"]
        assert user["role"] == random_user_data["role"]
        assert "id" in user
    
    with allure.step("Validate response schema"):
        validate_user(user)
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/api-tests.yml
name: API Tests

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
      matrix:
        python-version: [3.9, 3.10, 3.11]

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
    
    - name: Run tests
      run: |
        pytest --env=staging
      env:
        TEST_ENV: staging
        STAGING_CLIENT_ID: ${{ secrets.STAGING_CLIENT_ID }}
        STAGING_CLIENT_SECRET: ${{ secrets.STAGING_CLIENT_SECRET }}
    
    - name: Generate Allure Report
      uses: simple-elf/allure-report-action@master
      if: always()
      with:
        allure_results: allure-results
        allure_report: allure-report
        allure_history: allure-history
    
    - name: Publish Test Report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-report
        path: |
          report.html
          allure-report
```

## Complete Test Example

```python
# tests/users/test_user_crud.py
import pytest
import uuid
from utils.data_generator import generate_user
from utils.validators import validate_user, validate_users_list
from api.users_api import UsersApi

users_api = UsersApi()

class TestUserCRUD:
    """Test CRUD operations for users."""
    
    @pytest.fixture
    def unique_user_data(self):
        """Generate unique user data."""
        return generate_user({
            "email": f"test.user.{uuid.uuid4()}@example.com"
        })
    
    def test_create_and_get_user(self, auth_headers, unique_user_data):
        """Test creating a user and then retrieving it."""
        # Create user
        create_response = users_api.create_user(unique_user_data, headers=auth_headers)
        assert create_response.status_code == 201
        
        created_user = create_response.json()
        user_id = created_user["id"]
        
        try:
            # Verify created user data
            assert created_user["name"] == unique_user_data["name"]
            assert created_user["email"] == unique_user_data["email"]
            validate_user(created_user)
            
            # Get user by ID
            get_response = users_api.get_user(user_id, headers=auth_headers)
            assert get_response.status_code == 200
            
            retrieved_user = get_response.json()
            assert retrieved_user["id"] == user_id
            assert retrieved_user["name"] == unique_user_data["name"]
            assert retrieved_user["email"] == unique_user_data["email"]
            validate_user(retrieved_user)
            
        finally:
            # Cleanup: Delete the created user
            delete_response = users_api.delete_user(user_id, headers=auth_headers)
            assert delete_response.status_code == 204
    
    def test_update_user(self, auth_headers, unique_user_data):
        """Test updating a user."""
        # Create user
        create_response = users_api.create_user(unique_user_data, headers=auth_headers)
        user_id = create_response.json()["id"]
        
        try:
            # Update user
            update_data = {
                "name": "Updated Name",
                "role": "editor"
            }
            
            update_response = users_api.patch_user(user_id, update_data, headers=auth_headers)
            assert update_response.status_code == 200
            
            updated_user = update_response.json()
            assert updated_user["id"] == user_id
            assert updated_user["name"] == update_data["name"]
            assert updated_user["role"] == update_data["role"]
            assert updated_user["email"] == unique_user_data["email"]  # Email should not change
            validate_user(updated_user)
            
            # Verify update with GET
            get_response = users_api.get_user(user_id, headers=auth_headers)
            assert get_response.status_code == 200
            
            retrieved_user = get_response.json()
            assert retrieved_user["name"] == update_data["name"]
            assert retrieved_user["role"] == update_data["role"]
            
        finally:
            # Cleanup
            users_api.delete_user(user_id, headers=auth_headers)
    
    def test_delete_user(self, auth_headers, unique_user_data):
        """Test deleting a user."""
        # Create user
        create_response = users_api.create_user(unique_user_data, headers=auth_headers)
        user_id = create_response.json()["id"]
        
        # Delete user
        delete_response = users_api.delete_user(user_id, headers=auth_headers)
        assert delete_response.status_code == 204
        
        # Verify user is deleted
        get_response = users_api.get_user(user_id, headers=auth_headers)
        assert get_response.status_code == 404
    
    @pytest.mark.parametrize("invalid_data,expected_error", [
        ({"email": "invalid-email"}, "email"),
        ({"role": "invalid-role"}, "role"),
        ({}, "required")
    ])
    def test_create_user_validation(self, auth_headers, unique_user_data, invalid_data, expected_error):
        """Test validation errors when creating users with invalid data."""
        # Prepare invalid user data
        test_data = unique_user_data.copy()
        for key, value in invalid_data.items():
            if value:
                test_data[key] = value
            else:
                test_data.pop(key, None)
        
        # Attempt to create user with invalid data
        response = users_api.create_user(test_data, headers=auth_headers)
        
        # Verify error response
        assert response.status_code == 400
        error_data = response.json()
        assert "error" in error_data
        assert expected_error.lower() in error_data["error"].lower()
```

## Best Practices Summary

1. **Organize Tests Logically**: Structure tests by API endpoint or feature
2. **Use Fixtures for Setup/Teardown**: Create and clean up test data properly
3. **Implement Proper Validation**: Validate response status codes and data
4. **Handle Authentication**: Manage tokens efficiently
5. **Parameterize Tests**: Test multiple scenarios with parameterized tests
6. **Isolate Tests**: Make tests independent of each other
7. **Use Descriptive Test Names**: Name tests clearly to describe what they test
8. **Generate Random Test Data**: Use unique data to avoid conflicts
9. **Implement Proper Error Handling**: Handle and validate error responses
10. **Document Tests**: Add clear docstrings to explain test purpose
