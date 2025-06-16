# Python Coding Guidelines and PEP 8 Best Practices

## Introduction

This document outlines the recommended coding standards and best practices for Python development, primarily based on [PEP 8](https://peps.python.org/pep-0008/) - the official Python style guide. Following these guidelines will help ensure code consistency, readability, and maintainability across projects.

## Table of Contents

1. [Code Layout](#code-layout)
2. [Naming Conventions](#naming-conventions)
3. [Comments and Documentation](#comments-and-documentation)
4. [Programming Recommendations](#programming-recommendations)
5. [Imports](#imports)
6. [String Formatting](#string-formatting)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Tools for Enforcement](#tools-for-enforcement)
10. [Additional Resources](#additional-resources)

## Code Layout

### Indentation
- Use 4 spaces per indentation level
- Never mix tabs and spaces
- Line continuation should align wrapped elements vertically or use a hanging indent of 4 spaces

```python
# Good
def long_function_name(
        var_one, var_two, var_three,
        var_four):
    print(var_one)

# Also good
def long_function_name(
    var_one, var_two, var_three,
    var_four):
    print(var_one)
```

### Maximum Line Length
- Limit all lines to a maximum of 79 characters for code
- Limit docstrings/comments to 72 characters
- Use backslashes when necessary for line breaks:

```python
long_string = "This is a very long string that exceeds the 79 character limit \
and therefore needs to be split across multiple lines."
```

### Line Breaks
- Break before binary operators:

```python
# Good
income = (gross_wages
          + taxable_interest
          + (dividends - qualified_dividends)
          - ira_deduction
          - student_loan_interest)
```

### Blank Lines
- Surround top-level function and class definitions with two blank lines
- Method definitions inside a class are surrounded by a single blank line
- Use blank lines sparingly inside functions to indicate logical sections

### Imports
- Imports should be on separate lines:

```python
# Good
import os
import sys

# Not recommended
import os, sys
```

- Imports should be grouped in the following order:
  1. Standard library imports
  2. Related third-party imports
  3. Local application/library specific imports
- Each group should be separated by a blank line
- Absolute imports are preferred over relative imports

```python
# Standard library
import os
import sys

# Third-party
import numpy as np
import pandas as pd

# Local
from mypackage import module1
from mypackage.subpackage import module2
```

## Naming Conventions

### General Principles
- Names should be descriptive and avoid abbreviations where possible
- Choose names that reflect usage rather than implementation

### Specific Naming Styles

| Type | Convention | Examples |
|------|------------|----------|
| Functions | lowercase with underscores | `calculate_total()`, `get_name()` |
| Variables | lowercase with underscores | `user_count`, `total_items` |
| Classes | CapWords/CamelCase | `Person`, `BankAccount` |
| Constants | UPPERCASE with underscores | `MAX_CONNECTIONS`, `PI` |
| Modules | lowercase, short | `utils.py`, `helpers.py` |
| Packages | lowercase, no underscores | `mypackage` |
| Methods | lowercase with underscores | `save_data()`, `get_record()` |
| Private attributes | leading underscore | `_private_var`, `_internal_method()` |
| "Magic" methods | double underscores | `__init__()`, `__str__()` |

### Naming DON'Ts
- Avoid single character names except for counters or iterators
- Avoid names that conflict with Python keywords or built-in functions
- Avoid using `l` (lowercase letter L), `O` (uppercase letter O), or `I` (uppercase letter I) as single character variable names due to potential confusion with the numbers 1 and 0

## Comments and Documentation

### General Guidelines
- Comments should be complete sentences
- Use inline comments sparingly
- Update comments when code changes

### Docstrings
- All public modules, functions, classes, and methods should have docstrings
- Use triple double quotes (`"""`) for docstrings
- Follow either the Google style or NumPy style for consistency

```python
def calculate_mean(numbers):
    """
    Calculate the arithmetic mean of a list of numbers.
    
    Args:
        numbers (list): A list of numbers
        
    Returns:
        float: The arithmetic mean
        
    Raises:
        ValueError: If the list is empty
    """
    if not numbers:
        raise ValueError("Cannot calculate mean of empty list")
    return sum(numbers) / len(numbers)
```

### Block Comments
- Block comments apply to code that follows them
- Each line should start with a # and a single space
- Paragraphs are separated by a line with a single #

```python
# This is a block comment that explains
# the complex algorithm below in detail.
#
# It can span multiple paragraphs if needed.
complex_algorithm_result = perform_complex_calculation()
```

## Programming Recommendations

### General
- Code should be written for readability
- Don't compare boolean values to `True` or `False` using `==`

```python
# Good
if is_valid:
    # do something

# Not recommended
if is_valid == True:
    # do something
```

### Function Design
- Functions should do one thing well
- Keep functions short and focused
- Use default parameter values instead of modifying arguments in-place

### Return Statements
- Be consistent with return statements
- Functions should return the same type in all exit points if possible

### Conditionals
- Prefer positive statements over negative ones

```python
# Good
if is_valid:
    # do something

# Less readable
if not is_invalid:
    # do something
```

### String Quotes
- Be consistent with quote character usage (single vs. double)
- Use double quotes for docstrings

### Whitespace
- Avoid extraneous whitespace:

```python
# Good
spam(ham[1], {eggs: 2})

# Not recommended
spam( ham[ 1 ], { eggs: 2 } )
```

- Always surround these binary operators with a single space:
  - Assignment (`=`)
  - Augmented assignment (`+=`, `-=`, etc.)
  - Comparisons (`==`, `<`, `>`, `!=`, `<>`, `<=`, `>=`, `in`, `not in`, `is`, `is not`)
  - Booleans (`and`, `or`, `not`)

### Compound Statements
- Avoid putting multiple statements on the same line

```python
# Good
if x == 4:
    print(x, y)
    x, y = y, x

# Not recommended
if x == 4: print(x, y); x, y = y, x
```

## Imports

### Best Practices
- Import entire modules instead of individual symbols
- Avoid wildcard imports (`from module import *`)
- Use absolute imports rather than relative imports
- If using relative imports, be explicit:

```python
# Absolute imports (preferred)
from package.subpackage import module

# Explicit relative imports (when necessary)
from . import sibling_module
from .sibling_module import function
from ..parent_module import function
```

## String Formatting

### Preferred Methods
- Use f-strings (Python 3.6+) for string formatting:

```python
name = "Alice"
age = 30
# Good (Python 3.6+)
message = f"Hello, {name}. You are {age} years old."
```

- For earlier Python versions, use `str.format()`:

```python
# Good (Python 2.7+)
message = "Hello, {}. You are {} years old.".format(name, age)
```

- Avoid using the `%` operator for string formatting (old style)

## Error Handling

### Try/Except Blocks
- Be specific about the exceptions you catch
- Keep try clauses short
- Use the `finally` clause for cleanup actions

```python
# Good
try:
    value = dictionary[key]
except KeyError:
    # Handle missing key
    value = default_value
```

### Context Managers
- Use context managers (`with` statement) to ensure resources are properly managed:

```python
# Good
with open('file.txt', 'r') as file:
    data = file.read()
# File is automatically closed
```

## Testing

### General Guidelines
- Write tests for all new functionality
- Use a consistent testing framework (e.g., pytest, unittest)
- Aim for high test coverage
- Write both unit tests and integration tests

### Test Structure
- Follow the Arrange-Act-Assert pattern
- Keep tests independent of each other
- Use descriptive test names that explain the expected behavior

```python
def test_addition_of_positive_numbers():
    # Arrange
    a = 5
    b = 3
    
    # Act
    result = add(a, b)
    
    # Assert
    assert result == 8
```

## Tools for Enforcement

### Linters and Formatters
- **Flake8**: Combines PyFlakes, pycodestyle, and McCabe complexity
- **pylint**: More comprehensive but sometimes stricter
- **black**: Automatic code formatter with minimal configuration
- **isort**: Sorts imports alphabetically and automatically separates them into sections
- **mypy**: Static type checker for Python

### Integration
- Set up pre-commit hooks to run these tools automatically
- Configure your IDE to highlight style violations
- Include linting in your CI/CD pipeline

## Additional Resources

- [PEP 8 -- Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [PEP 257 -- Docstring Conventions](https://peps.python.org/pep-0257/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
- [The Hitchhiker's Guide to Python](https://docs.python-guide.org/)
- [Real Python - Python Code Quality](https://realpython.com/python-code-quality/)

## Conclusion

Following these guidelines will help you write clean, readable, and maintainable Python code. Remember that consistency is key - it's more important to be consistent within a project than to follow every guideline perfectly. When working on existing projects, follow the established style of that codebase.
