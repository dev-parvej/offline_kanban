export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'archived';
  columnId: string;
  columnName: string;
  assignee?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  autoArchiveDays?: number;
  createdBy?: string;
  createdByName?: string;
}

export interface TaskCreateRequest {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  columnId: string;
  assignee?: string;
  checklist: ChecklistItem[];
  dueDate?: string;
  autoArchiveDays?: number;
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  id: string;
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