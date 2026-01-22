# Task Manager Application

A simple task management application with a Java Spring Boot backend and React frontend.

## Features

- **Create tasks** - Add new tasks with title, description, priority, and due date
- **View tasks** - See all tasks with detailed information
- **Edit tasks** - Modify existing tasks including all fields and completion status
- **Delete tasks** - Remove tasks from the list
- **Toggle completion** - Quickly mark tasks as complete or incomplete
- **Filter tasks** - Filter by status (all, active, completed)
- **Priority levels** - Set task priority (low, medium, high) with visual indicators
- **Due dates** - Set and track task due dates
- **Form validation** - Client-side validation for required fields and data integrity
- **Error handling** - Comprehensive error messages for better user experience


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

## Project Structure

```
task-manager/
├── backend/                 # Java Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/taskmanager/
│   │   │   │   ├── config/        # Configuration classes (CORS, Web)
│   │   │   │   ├── controller/    # REST API controllers
│   │   │   │   ├── exception/     # Global exception handlers
│   │   │   │   ├── model/         # Entity classes
│   │   │   │   ├── repository/    # Data access layer
│   │   │   │   ├── service/       # Business logic
│   │   │   │   └── TaskManagerApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   ├── Dockerfile           # Backend Docker configuration
│   └── pom.xml              # Maven configuration
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── TaskForm.js  # Form for creating/editing tasks
│   │   │   ├── TaskItem.js  # Individual task component
│   │   │   ├── TaskList.js  # Task list container
│   │   │   └── TaskFilter.js # Filter component
│   │   ├── services/        # API service layer
│   │   │   └── taskService.js # API calls with error handling
│   │   ├── App.js           # Main application component
│   │   ├── index.js         # Entry point
│   │   └── index.css        # Global styles
│   ├── nginx.conf           # Nginx configuration for production
│   ├── Dockerfile           # Frontend Docker configuration
│   └── package.json         # npm configuration
└── docker-compose.yml       # Multi-container Docker setup
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js and npm
- Maven
- Docker (optional, for containerized deployment)

### Running with Docker (Recommended)

1. Build and run the entire stack:
   ```bash
   docker build -t taskmanager-backend:dev -f backend/Dockerfile ./backend
   docker build -t taskmanager-frontend:dev -f frontend/Dockerfile ./frontend
   ```

2. Run the containers:
   ```bash
   docker run -d --name taskmanager-backend -p 8080:8080 taskmanager-backend:dev
   docker run -d --name taskmanager-frontend -p 3000:80 taskmanager-frontend:dev
   ```

3. Access the application at http://localhost:3000

### Running Locally

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

3. The backend will start on http://localhost:8080

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
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

### Request/Response Examples

#### Create Task (POST /api/tasks)
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "HIGH",
  "dueDate": "2026-01-30T17:00:00.000Z",
  "completed": false
}
```

#### Update Task (PUT /api/tasks/{id})
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "dueDate": "2026-02-01T17:00:00.000Z",
  "completed": true
}
```

#### Response
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "HIGH",
  "dueDate": "2026-01-30T17:00:00.000",
  "completed": false,
  "createdAt": "2026-01-22T00:00:00.000",
  "updatedAt": "2026-01-22T00:00:00.000"
}
```

## Edit Task Functionality

The application includes comprehensive edit functionality:

### Frontend Edit Features

1. **Edit Button**: Each task item has an "Edit" button that triggers edit mode
2. **Form Population**: When editing, the form automatically populates with existing task data:
   - Title
   - Description
   - Priority (LOW, MEDIUM, HIGH)
   - Due Date
   - Completion status (checkbox, only shown in edit mode)
3. **Visual Feedback**: The form title changes to "Edit Task" when in edit mode
4. **Cancel Option**: A "Cancel" button appears in edit mode to discard changes
5. **Form Validation**: 
   - Required field validation (title)
   - Due date validation (prevents past dates for new tasks)
   - Real-time error messages
6. **Auto-scroll**: Page automatically scrolls to the form when edit button is clicked
7. **Error Handling**: Clear error messages if update fails, keeping edit mode active for retry

### Backend Edit Support

1. **PUT Endpoint**: `/api/tasks/{id}` accepts all task fields for update
2. **Timestamp Management**: Automatically updates `updatedAt` timestamp
3. **Data Integrity**: Validates required fields (title)
4. **Error Responses**: Returns appropriate HTTP status codes:
   - 200 OK - Successful update
   - 400 Bad Request - Validation errors
   - 404 Not Found - Task doesn't exist
5. **CORS Support**: Configured to accept requests from frontend origin

### Edit Workflow

1. User clicks "Edit" button on a task
2. Page scrolls to the top form
3. Form populates with existing task data
4. Form title changes to "Edit Task"
5. "Cancel" button appears next to "Update Task" button
6. Completion status checkbox is displayed
7. User modifies desired fields
8. On submit:
   - Frontend validates input
   - Sends PUT request to backend with all fields
   - Backend validates and updates task
   - Backend updates `updatedAt` timestamp
   - Returns updated task
   - Frontend updates task list with new data
   - Form exits edit mode
9. If error occurs:
   - Error message is displayed
   - Form remains in edit mode
   - User can retry or cancel

### Data Integrity Features

- Title is required for all tasks
- Timestamps are managed automatically by the backend
- Completion status is properly synchronized between toggle and edit operations
- Failed updates don't clear the form, allowing users to retry
- Task list updates reflect changes immediately upon successful save

## Development Notes

- H2 in-memory database is used for development (data is lost on restart)
- CORS is configured to allow requests from `http://localhost:3000`
- Backend runs on port 8080, frontend on port 3000
- All API endpoints are prefixed with `/api`
- Docker support available for containerized deployment
