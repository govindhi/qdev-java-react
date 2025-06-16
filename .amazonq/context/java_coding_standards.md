# Java Coding Standards and Best Practices

## Introduction

This document outlines recommended coding standards and best practices for Java development. Following these guidelines will help ensure code consistency, readability, and maintainability across projects.

## Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [Source File Organization](#source-file-organization)
3. [Formatting](#formatting)
4. [Documentation and Comments](#documentation-and-comments)
5. [Programming Practices](#programming-practices)
6. [Exception Handling](#exception-handling)
7. [Concurrency](#concurrency)
8. [Testing](#testing)
9. [Performance Considerations](#performance-considerations)
10. [Tools for Enforcement](#tools-for-enforcement)
11. [Additional Resources](#additional-resources)

## Naming Conventions

### General Principles
- Names should be descriptive and avoid abbreviations where possible
- Choose names that reflect usage rather than implementation
- Avoid Hungarian notation

### Specific Naming Styles

| Type | Convention | Examples |
|------|------------|----------|
| Classes | UpperCamelCase | `Customer`, `BankAccount` |
| Interfaces | UpperCamelCase | `Comparable`, `Serializable` |
| Methods | lowerCamelCase | `calculateTotal()`, `getName()` |
| Variables | lowerCamelCase | `userCount`, `totalItems` |
| Constants | UPPERCASE_WITH_UNDERSCORES | `MAX_CONNECTIONS`, `PI` |
| Packages | lowercase, no underscores | `com.company.project` |
| Enum types | UpperCamelCase | `Color`, `Status` |
| Enum values | UPPERCASE_WITH_UNDERSCORES | `Color.RED`, `Status.ACTIVE` |
| Generic type parameters | Single uppercase letter | `T`, `E`, `K`, `V` |

### Naming DON'Ts
- Avoid single character names except for temporary variables
- Avoid names that conflict with Java keywords or common types
- Avoid abbreviations unless they are widely understood

## Source File Organization

### File Structure
1. Package statement
2. Import statements
3. Exactly one top-level class

### Import Organization
- No wildcard imports (e.g., `import java.util.*`)
- Organize imports in the following order:
  1. Java core packages (`java.*`)
  2. Java extension packages (`javax.*`)
  3. External third-party packages
  4. Internal project packages
- Within each group, sort alphabetically

```java
import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;

import org.apache.commons.lang3.StringUtils;

import com.company.project.util.Helper;
```

### Class Structure
Organize class members in the following order:
1. Static variables (public, protected, package-private, private)
2. Instance variables (public, protected, package-private, private)
3. Constructors
4. Methods (grouped by functionality)
5. Inner classes and interfaces

## Formatting

### Indentation and Line Wrapping
- Use 4 spaces for indentation, not tabs
- Maximum line length: 100-120 characters
- When wrapping lines, indent continuation lines by 8 spaces

```java
// Good line wrapping example
public void someMethod(String param1, String param2, String param3,
        String param4, String param5) {
    // Method body
}
```

### Braces
- Use the K&R style (opening brace at the end of the line)
- Always use braces, even for single-statement blocks

```java
// Good
if (condition) {
    doSomething();
}

// Not recommended
if (condition)
    doSomething();
```

### Whitespace
- One space after keywords like `if`, `for`, `while`, etc.
- No space between method name and opening parenthesis
- One space around binary operators
- No space before semicolons

```java
// Good
for (int i = 0; i < 10; i++) {
    method(arg1, arg2);
}
```

### Variable Declarations
- One variable declaration per line
- Initialize variables where they're declared when possible
- Declare variables in the narrowest scope possible

```java
// Good
int count = 0;
String name = "John";

// Not recommended
int count = 0, total = 0;
```

## Documentation and Comments

### Javadoc
- All public classes, interfaces, and methods should have Javadoc comments
- Include `@param`, `@return`, `@throws` tags as appropriate
- First sentence should be a summary that can stand alone

```java
/**
 * Calculates the average of a list of numbers.
 *
 * @param numbers the list of numbers to average
 * @return the arithmetic mean of the numbers
 * @throws IllegalArgumentException if the list is empty
 */
public double calculateAverage(List<Double> numbers) {
    // Implementation
}
```

### Implementation Comments
- Use comments to explain complex algorithms or non-obvious code
- Avoid obvious comments that restate the code
- Keep comments up-to-date when code changes

```java
// Complex algorithm explanation
// This uses the Knuth-Morris-Pratt algorithm for pattern matching
// which has O(n+m) time complexity
```

### TODO Comments
- Use TODO comments for temporary, short-term solutions
- Include your name/identifier and a description of what needs to be done

```java
// TODO(johndoe): Replace with more efficient algorithm once data structure is finalized
```

## Programming Practices

### Object-Oriented Design
- Follow SOLID principles:
  - Single Responsibility Principle
  - Open/Closed Principle
  - Liskov Substitution Principle
  - Interface Segregation Principle
  - Dependency Inversion Principle
- Prefer composition over inheritance
- Program to interfaces, not implementations

### Immutability
- Make classes immutable when possible
- Use `final` for variables that should not be reassigned
- Use unmodifiable collections when returning collections from methods

```java
// Returning an unmodifiable collection
public List<String> getItems() {
    return Collections.unmodifiableList(items);
}
```

### Null Handling
- Use `Optional<T>` for return values that might be absent
- Use `@Nullable` and `@NonNull` annotations to document nullability
- Check parameters for null when appropriate

```java
// Using Optional
public Optional<User> findUserById(String id) {
    // Implementation
}

// Client code
userService.findUserById("123")
    .ifPresent(user -> System.out.println(user.getName()));
```

### Resource Management
- Always close resources in a `finally` block or use try-with-resources
- Prefer try-with-resources for automatic resource management

```java
// Good - try-with-resources
try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
    // Use reader
}
```

### Method Design
- Methods should do one thing well
- Keep methods short (generally under 30 lines)
- Limit the number of parameters (4 or fewer)
- Use method overloading judiciously

### Constants
- Define constants for magic numbers and strings
- Use `static final` for constants
- Consider using enum types for related constants

```java
// Good
private static final int MAX_USERS = 100;

// Not recommended
if (users.size() > 100) { // Magic number
    // Implementation
}
```

## Exception Handling

### General Guidelines
- Don't catch exceptions you can't handle properly
- Don't swallow exceptions (catch and do nothing)
- Include useful information in exception messages

### Exception Types
- Use checked exceptions for recoverable conditions
- Use unchecked exceptions for programming errors
- Create custom exceptions when standard exceptions don't apply

```java
// Custom exception
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceId) {
        super("Resource not found with ID: " + resourceId);
    }
}
```

### Try-Catch Blocks
- Keep try blocks small
- Catch specific exceptions rather than general ones
- Log exceptions with appropriate context

```java
// Good
try {
    // Risky operation
} catch (SpecificException e) {
    logger.error("Failed to process: {}", id, e);
    throw new ServiceException("Processing failed", e);
}
```

## Concurrency

### Thread Safety
- Make classes thread-safe or clearly document that they're not
- Use `synchronized`, `volatile`, or `java.util.concurrent` utilities
- Avoid using `synchronized` on public methods

### Concurrent Collections
- Use concurrent collections from `java.util.concurrent` package
- Prefer `ConcurrentHashMap` over `HashMap` for concurrent access
- Use `CopyOnWriteArrayList` for frequently read, rarely written lists

```java
// Thread-safe collection
private final Map<String, User> userCache = new ConcurrentHashMap<>();
```

### Executors
- Use `ExecutorService` instead of creating threads directly
- Properly shut down executors when they're no longer needed
- Consider using thread pools for managing multiple tasks

```java
// Using ExecutorService
ExecutorService executor = Executors.newFixedThreadPool(10);
try {
    executor.submit(() -> processTask());
} finally {
    executor.shutdown();
}
```

## Testing

### Unit Testing
- Write tests for all public methods
- Follow the AAA pattern (Arrange, Act, Assert)
- Use meaningful test names that describe the scenario and expected outcome

```java
@Test
public void shouldReturnUserWhenValidIdProvided() {
    // Arrange
    String userId = "123";
    when(userRepository.findById(userId)).thenReturn(Optional.of(new User(userId)));
    
    // Act
    User result = userService.getUserById(userId);
    
    // Assert
    assertNotNull(result);
    assertEquals(userId, result.getId());
}
```

### Mocking
- Use mocking frameworks (Mockito, EasyMock) for dependencies
- Don't mock value objects or entities
- Mock at the same level of abstraction

### Test Coverage
- Aim for high test coverage (80%+)
- Focus on testing business logic and edge cases
- Don't just test for coverage metrics

## Performance Considerations

### Efficient Collections
- Choose the right collection for the use case
- Consider memory usage and access patterns
- Use appropriate initial capacity for collections

```java
// Specifying initial capacity
Map<String, User> userMap = new HashMap<>(expectedSize);
```

### String Handling
- Use `StringBuilder` for string concatenation in loops
- Use `String.format()` or string templates for complex formatting
- Reuse `Pattern` objects for regular expressions

```java
// Good
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}
```

### Resource Pooling
- Use connection pools for database connections
- Reuse expensive objects when possible
- Release resources promptly when no longer needed

## Tools for Enforcement

### Static Analysis
- **Checkstyle**: Enforces coding style
- **PMD**: Detects potential bugs and suboptimal code
- **SpotBugs**: Finds bugs in Java programs
- **SonarQube**: Comprehensive code quality platform

### Build Integration
- Configure Maven or Gradle to run static analysis during builds
- Set up CI/CD pipelines to enforce code quality gates
- Use IDE plugins for real-time feedback

```xml
<!-- Maven Checkstyle plugin example -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <failOnViolation>true</failOnViolation>
    </configuration>
</plugin>
```

## Additional Resources

- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [Oracle Code Conventions for the Java Programming Language](https://www.oracle.com/java/technologies/javase/codeconventions-contents.html)
- [Effective Java by Joshua Bloch](https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/)
- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Java Concurrency in Practice by Brian Goetz](https://jcip.net/)

## Conclusion

Following these guidelines will help you write clean, readable, and maintainable Java code. Remember that consistency is key - it's more important to be consistent within a project than to follow every guideline perfectly. When working on existing projects, follow the established style of that codebase.
