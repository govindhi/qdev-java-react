package com.example.taskmanager.controller;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing tasks.
 */
@RestController
@RequestMapping("/api/tasks")
@Validated
public class TaskController {

    private final TaskService taskService;

    /**
     * Constructor for dependency injection.
     * 
     * @param taskService the task service to be injected
     */
    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Get all tasks or filter by completion status.
     * 
     * @param completed optional filter for task completion status
     * @return list of tasks
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Boolean completed) {
        List<Task> tasks;
        if (completed != null) {
            tasks = taskService.getTasksByStatus(completed);
        } else {
            tasks = taskService.getAllTasks();
        }
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get a task by its ID.
     * 
     * @param id the ID of the task to retrieve
     * @return the task if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new task.
     * 
     * @param task the task data to create
     * @return the created task with 201 Created status
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * Update an existing task.
     * 
     * @param id the ID of the task to update
     * @param task the updated task data
     * @return the updated task if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody Task task) {
        return taskService.updateTask(id, task)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Toggle the completion status of a task.
     * 
     * @param id the ID of the task to toggle
     * @return the updated task if found, or 404 Not Found
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTaskCompletion(@PathVariable Long id) {
        return taskService.toggleTaskCompletion(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a task by its ID.
     * 
     * @param id the ID of the task to delete
     * @return success status if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("deleted", true));
        }
        return ResponseEntity.notFound().build();
    }
}
