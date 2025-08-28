import { api } from "./axios";

// Types that match the backend DTOs
export interface CreateChecklistRequest {
  title: string;
  task_id: number;
}

export interface UpdateChecklistRequest {
  title: string;
}

export interface ToggleChecklistRequest {
  completed: boolean;
}

export interface UserDto {
  id: number;
  user_name: string;
  name: string;
}

export interface ChecklistResponse {
  id: number;
  title: string;
  task_id: number;
  created_by: number;
  completed_by?: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  created_by_user?: UserDto;
  completed_by_user?: UserDto;
}

export interface ChecklistListResponse {
  checklists: ChecklistResponse[];
  task_id: number;
  total: number;
  completed: number;
}

// Checklist service functions
export const getTaskChecklists = async (taskId: number): Promise<ChecklistListResponse> => {
  const response = await api.get(`/tasks/${taskId}/checklists`);
  return response.data;
};

export const createChecklist = async (taskId: number, data: CreateChecklistRequest): Promise<{ checklist: ChecklistResponse }> => {
  const response = await api.post(`/tasks/${taskId}/checklists`, data);
  return response.data;
};

export const updateChecklist = async (
  taskId: number, 
  checklistId: number, 
  data: UpdateChecklistRequest
): Promise<{ checklist: ChecklistResponse }> => {
  const response = await api.put(`/tasks/${taskId}/checklists/${checklistId}`, data);
  return response.data;
};

export const toggleChecklist = async (
  taskId: number, 
  checklistId: number, 
  data: ToggleChecklistRequest
): Promise<{ checklist: ChecklistResponse }> => {
  const response = await api.post(`/tasks/${taskId}/checklists/${checklistId}/toggle`, data);
  return response.data;
};

export const deleteChecklist = async (taskId: number, checklistId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/tasks/${taskId}/checklists/${checklistId}`);
  return response.data;
};