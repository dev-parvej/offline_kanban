import { api } from "./axios";

export interface Column {
  id: number;
  title: string;
  position: number;
  is_active: boolean;
  color?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  task_count?: number;
  created_by_user?: {
    id: number;
    user_name: string;
    name: string;
  };
}

export interface CreateColumnRequest {
  title: string;
  color?: string;
}

export interface UpdateColumnRequest {
  title?: string;
  color?: string;
}

export interface ReorderColumnsRequest {
  columns: Array<{
    id: number;
    position: number;
  }>;
}

export interface MoveTasksRequest {
  destination_column_id: number;
}

// Column service functions
export const getColumns = async (): Promise<{ columns: Column[] }> => {
  const response = await api.get('/settings/columns');
  return response.data;
};

export const getColumn = async (id: number): Promise<{ column: Column }> => {
  const response = await api.get(`/settings/columns/${id}`);
  return response.data;
};

export const createColumn = async (data: CreateColumnRequest): Promise<{ column: Column }> => {
  const response = await api.post('/settings/columns', data);
  return response.data;
};

export const updateColumn = async (id: number, data: UpdateColumnRequest): Promise<{ column: Column }> => {
  const response = await api.put(`/settings/columns/${id}`, data);
  return response.data;
};

export const deleteColumn = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/settings/columns/${id}`);
  return response.data;
};

export const getColumnsWithTaskCounts = async (): Promise<{ columns: Column[] }> => {
  const response = await api.get('/settings/columns/with-counts');
  return response.data;
};

export const getColumnsWithCreators = async (): Promise<{ columns: Column[] }> => {
  const response = await api.get('/settings/columns/with-creators');
  return response.data;
};

export const reorderColumns = async (data: ReorderColumnsRequest): Promise<{ message: string }> => {
  const response = await api.post('/settings/columns/reorder', data);
  return response.data;
};

export const moveAllTasksFromColumn = async (id: number, data: MoveTasksRequest): Promise<{ message: string }> => {
  const response = await api.post(`/settings/columns/${id}/move-tasks`, data);
  return response.data;
};