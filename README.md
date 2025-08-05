# Task Manager Application

A simple task management application with a Java Spring Boot backend and React frontend.

## Features

- Create, read, update, and delete tasks
- Mark tasks as completed
- Filter tasks by status (all, active, completed)
- Set task priority (low, medium, high)
- Set due dates for tasks
- **Light/Dark Mode Toggle** - Switch between light and dark themes with automatic persistence


## Tech Stack

### Backend
- Java 17
- Spring Boot 3.1.0
- Spring Data JPA
- H2 Database (in-memory)
- Maven

### Frontend
- React 18
- Axios for API calls
- CSS for styling
- React Context API for theme management

## Project Structure

```
task-manager/
├── backend/                 # Java Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/taskmanager/
│   │   │   │   ├── controller/    # REST API controllers
│   │   │   │   ├── model/         # Entity classes
│   │   │   │   ├── repository/    # Data access layer
│   │   │   │   ├── service/       # Business logic
│   │   │   │   └── TaskManagerApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml              # Maven configuration
└── frontend/                # React frontend
    ├── public/              # Static files
    ├── src/
    │   ├── components/      # React components
    │   │   ├── TaskForm.js
    │   │   ├── TaskList.js
    │   │   ├── TaskItem.js
    │   │   ├── TaskFilter.js
    │   │   └── ThemeToggle.js  # Light/Dark mode toggle
    │   ├── contexts/        # React contexts
    │   │   └── ThemeContext.js # Theme management
    │   ├── services/        # API service layer
    │   ├── __tests__/       # Test files
    │   ├── App.js           # Main application component
    │   ├── index.js         # Entry point
    │   └── index.css        # Global styles with theme support
    └── package.json         # npm configuration
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js and npm
- Maven

### Running the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Build and run the Spring Boot application:
   ```
   mvn spring-boot:run
   ```

3. The backend will start on http://localhost:8080

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

4. The frontend will start on http://localhost:3000

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?completed=true|false` - Get tasks by completion status
- `GET /api/tasks/{id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `PATCH /api/tasks/{id}/toggle` - Toggle task completion status
- `DELETE /api/tasks/{id}` - Delete a task
