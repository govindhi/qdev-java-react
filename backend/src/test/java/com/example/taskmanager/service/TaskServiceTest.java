package com.example.taskmanager.service;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testUpdateTask() {
        // Create an existing task
        Task existingTask = new Task();
        existingTask.setId(1L);
        existingTask.setTitle("Original Title");
        existingTask.setDescription("Original Description");
        existingTask.setPriority(Task.Priority.LOW);
        existingTask.setCompleted(false);
        existingTask.setCreatedAt(LocalDateTime.now().minusDays(1));
        existingTask.setUpdatedAt(LocalDateTime.now().minusDays(1));

        // Create updated task details
        Task updatedDetails = new Task();
        updatedDetails.setTitle("Updated Title");
        updatedDetails.setDescription("Updated Description");
        updatedDetails.setPriority(Task.Priority.HIGH);
        updatedDetails.setCompleted(true);

        // Mock repository behavior
        when(taskRepository.findById(1L)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Call the service method
        Optional<Task> result = taskService.updateTask(1L, updatedDetails);

        // Verify the result
        assertTrue(result.isPresent());
        Task updatedTask = result.get();
        assertEquals("Updated Title", updatedTask.getTitle());
        assertEquals("Updated Description", updatedTask.getDescription());
        assertEquals(Task.Priority.HIGH, updatedTask.getPriority());
        assertTrue(updatedTask.isCompleted());
        
        // Original creation date should be preserved
        assertEquals(existingTask.getCreatedAt(), updatedTask.getCreatedAt());
        
        // Updated date should be newer
        assertNotEquals(existingTask.getUpdatedAt(), updatedTask.getUpdatedAt());
        
        // Verify repository interactions
        verify(taskRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    public void testUpdateTaskNotFound() {
        // Mock repository behavior for non-existent task
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // Call the service method
        Optional<Task> result = taskService.updateTask(999L, new Task());

        // Verify the result
        assertFalse(result.isPresent());
        
        // Verify repository interactions
        verify(taskRepository).findById(999L);
        verify(taskRepository, never()).save(any(Task.class));
    }
}