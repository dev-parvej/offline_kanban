export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

// Frontend Task interface that matches backend TaskResponse
export interface Task {
  id: number;
  title: string;
  description?: string;
  column_id: number;
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  position: number;
  weight: number;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: number;
    user_name: string;
    name: string;
  };
  created_by_user?: {
    id: number;
    user_name: string;
    name: string;
  };
  column_title?: string;
  comment_count?: number;
  // Legacy fields for backward compatibility with UI components
  content?: string;
  status?: 'active' | 'archived';
  columnId?: string;
  columnName?: string;
  assignee?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  checklist?: ChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  autoArchiveDays?: number;
  createdByName?: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  column_id: number;
  assigned_to?: number;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  assigned_to?: number;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TaskMoveRequest {
  column_id: number;
  new_position: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  designation?: string;
  is_root: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: string;
  name: string;
  position: number;
  color?: string;
}