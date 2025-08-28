import { api } from "./axios";

// Types that match the backend DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string;
  column_id: number;
  assigned_to?: number;
  due_date?: string; // ISO format: 2024-01-15T10:30:00Z
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigned_to?: number;
  due_date?: string; // ISO format: 2024-01-15T10:30:00Z
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface MoveTaskRequest {
  column_id: number;
  new_position: number;
}

export interface TaskFilters {
  search?: string;
  column_id?: number;
  assigned_to?: number;
  created_by?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date_from?: string;
  due_date_to?: string;
  created_from?: string;
  created_to?: string;
  page?: number;
  page_size?: number;
  order_by?: 'position' | 'created_at' | 'updated_at' | 'title' | 'due_date';
  order_dir?: 'asc' | 'desc';
}

export interface UserDto {
  id: number;
  user_name: string;
  name: string;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  column_id: number;
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  priority?: string;
  position: number;
  weight: number;
  created_at: string;
  updated_at: string;
  assigned_user?: UserDto;
  created_by_user?: UserDto;
  column_title?: string;
  comment_count?: number;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Task service functions
export const createTask = async (data: CreateTaskRequest): Promise<{ task: TaskResponse }> => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const getTasks = async (filters?: TaskFilters): Promise<TaskListResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get(`/tasks${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

export const getTask = async (id: number): Promise<{ task: TaskResponse }> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const updateTask = async (id: number, data: UpdateTaskRequest): Promise<{ task: TaskResponse }> => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const moveTask = async (id: number, data: MoveTaskRequest): Promise<{ message: string }> => {
  const response = await api.post(`/tasks/${id}/move`, data);
  return response.data;
};

export const deleteTask = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/tasks/${id}`);
  return response.data;
};

export const forceUpdateTask = async (id: number, data: UpdateTaskRequest): Promise<{ task: TaskResponse }> => {
  const response = await api.put(`/admin/tasks/${id}/force-update`, data);
  return response.data;
};