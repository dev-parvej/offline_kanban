import { api } from "./axios";

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_username: string;
}

export interface CreateCommentRequest {
  content: string;
  task_id: number;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentResponse {
  comment: Comment;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
}

// Create a new comment
export const createComment = async (data: CreateCommentRequest): Promise<CommentResponse> => {
  const response = await api.post('/comments', data);
  return response.data;
};

// Get comments for a specific task
export const getCommentsByTask = async (taskId: number): Promise<CommentListResponse> => {
  const response = await api.get(`/comments/task/${taskId}`);
  return response.data;
};

// Get single comment
export const getComment = async (id: number): Promise<CommentResponse> => {
  const response = await api.get(`/comments/${id}`);
  return response.data;
};

// Update comment
export const updateComment = async (id: number, data: UpdateCommentRequest): Promise<CommentResponse> => {
  const response = await api.put(`/comments/${id}`, data);
  return response.data;
};

// Delete comment
export const deleteComment = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};