# Task Manager Application

A simple task management application with a Java Spring Boot backend and React frontend.

## Features

- Create, read, update, and delete tasks
- **Enhanced Edit Task Functionality** with visual indicators and user feedback
- Mark tasks as completed
- Filter tasks by status (all, active, completed)
- Set task priority (low, medium, high)
- Set due dates for tasks
- Real-time visual feedback for edit operations
- Intuitive edit mode with distinct styling and notifications


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
    │   ├── services/        # API service layer
    │   ├── App.js           # Main application component
    │   └── index.js         # Entry point
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

## Edit Task Feature

The application includes a comprehensive edit task functionality with the following enhancements:

### How to Edit a Task

1. **Click the Edit Button**: Each task has an orange "Edit" button (✏️ Edit) in the task actions area
2. **Visual Feedback**: When editing:
   - The task form switches to "Edit Mode" with orange styling and an edit icon
   - The task being edited is highlighted with an orange border and "Currently editing" indicator
   - A notification shows which task you're editing
3. **Make Changes**: Modify any task fields (title, description, priority, due date)
4. **Save or Cancel**: 
   - Click "💾 Update Task" to save changes
   - Click "❌ Cancel" to exit edit mode without saving
5. **Success Confirmation**: A green success message confirms when the task is updated

### Edit Mode Visual Indicators

- **Form Styling**: Orange background and border when in edit mode
- **Task Highlighting**: The task being edited has a distinct orange highlight
- **Button States**: Edit buttons are disabled for the task currently being edited
- **Icons and Emojis**: Visual cues throughout the interface (✏️, 💾, ❌, ✅)
- **Success Messages**: Clear feedback when operations complete successfully

### Technical Implementation

- **Backend**: RESTful PUT endpoint at `/api/tasks/{id}` handles task updates
- **Frontend**: React state management with visual feedback and form validation
- **Real-time Updates**: Immediate UI updates without page refresh
- **Error Handling**: Comprehensive error messages and recovery options
