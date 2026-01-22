import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tasks';

// Configure axios to handle errors consistently
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || error.response.statusText;
    throw new Error(`Server error: ${message}`);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Unable to reach the server. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

export const getAllTasks = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTasksByStatus = async (completed) => {
  try {
    const response = await axios.get(`${API_URL}?completed=${completed}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTaskById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(API_URL, taskData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, taskData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Task not found. It may have been deleted.');
    }
    handleApiError(error);
  }
};

export const toggleTaskCompletion = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/toggle`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Task not found. It may have been deleted.');
    }
    handleApiError(error);
  }
};

export const deleteTask = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Task not found. It may have been deleted.');
    }
    handleApiError(error);
  }
};
