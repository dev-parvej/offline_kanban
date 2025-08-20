// User Types
export interface User {
  id: number;
  name: string;
  username: string;
  is_root: boolean;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Column Types
export interface Column {
  id: number;
  title: string;
  description?: string;
  color: string;
  before_column_id?: number;
  after_column_id?: number;
  is_archived: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  wip_limit?: number;
  wip_enabled: boolean;
  
  // Loaded relationships and computed fields
  created_by_user?: User;
  task_count?: number;
  completed_task_count?: number;
}

// Task Types
export interface Task {
  id: number;
  title: string;
  content?: string;
  column_id: number;
  assigned_to?: number;
  created_by: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'archived';
  auto_archive_days?: number;
  archive_date?: string;
  due_date?: string;
  completed_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  time_logged?: number; // in minutes
  
  // Loaded relationships
  assigned_user?: User;
  created_by_user?: User;
  column?: Column;
  comments?: Comment[];
  comment_count: number;
  labels?: string[];
}

// Comment Types
export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  
  // Loaded relationships
  user?: User;
}

// History Types
export interface History {
  id: number;
  task_id: number;
  user_id: number;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description: string;
  created_at: string;
  
  // Loaded relationships
  user?: User;
}

// Notification Types
export interface Notification {
  id: number;
  recipient_id: number;
  sender_id?: number;
  type: string;
  title: string;
  message: string;
  task_id?: number;
  comment_id?: number;
  data?: string; // JSON string
  is_read: boolean;
  is_system: boolean;
  created_at: string;
  read_at?: string;
  
  // Loaded relationships
  sender?: User;
  task?: Task;
  comment?: Comment;
}

// Filter Types
export interface BoardFilter {
  searchText?: string;
  assigneeFilter: 'all' | 'unassigned' | 'me' | `user:${number}`;
  creatorFilter: 'all' | 'me' | `user:${number}`;
  priorityFilter?: 'low' | 'medium' | 'high' | 'urgent';
  quickFilters: string[];
}

export interface UserFilters {
  searchText?: string;
  roleFilter?: 'all' | 'root' | 'normal';
  statusFilter?: 'all' | 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: string;
}

export interface ColumnFilters {
  searchText?: string;
  hasTasksFilter?: 'all' | 'with-tasks' | 'empty' | 'over-wip';
  colorFilter?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface TaskListFilters {
  searchText?: string;
  assigneeId?: number;
  creatorId?: number;
  columnId?: number;
  priority?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  includeArchived: boolean;
  sortBy: string;
  sortOrder: string;
  limit?: number;
  offset?: number;
}

// Form Types
export interface CreateTaskData {
  title: string;
  content?: string;
  column_id: number;
  assigned_to?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  auto_archive_days?: number;
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  due_date?: string;
  labels?: string[];
}

export interface CreateUserData {
  name: string;
  username: string;
  password: string;
  is_root: boolean;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  password?: string;
}

export interface CreateColumnData {
  title: string;
  description?: string;
  color: string;
  position: 'first' | 'last' | 'before' | 'after';
  referenceId?: number;
}

export interface UpdateColumnData {
  title?: string;
  description?: string;
  color?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component Props Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
}

export interface BoardState {
  columns: Column[];
  tasks: { [columnId: number]: Task[] };
  filters: BoardFilter;
  loading: boolean;
  error?: string;
}

export interface TaskState {
  tasks: Task[];
  filters: TaskListFilters;
  totalCount: number;
  currentPage: number;
  loading: boolean;
  error?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error?: string;
}

// Utility Types
export type Permission = 
  | 'create_user'
  | 'edit_user' 
  | 'create_column'
  | 'edit_column'
  | 'archive_column'
  | 'create_task'
  | 'edit_any_task'
  | 'assign_task'
  | 'archive_task'
  | 'move_any_task';

export interface TaskListItem extends Task {
  assigned_user_name?: string;
  created_by_user_name: string;
  column_title: string;
  last_comment_at?: string;
}