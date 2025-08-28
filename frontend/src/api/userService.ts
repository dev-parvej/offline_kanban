import { User } from "./authService";
import { api } from "./axios";

export interface UserResponse {
  id: number;
  user_name: string;
  name?: string;
  email: string;
  designation?: string;
  is_root: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await api.get('/admin/users');
    return response.data;
}

export const saveUser = async (data: User) => {
    await api.post('/admin/users', data)
} 

export const updateUser = async (id: number, data: User) => {
    await api.put(`/admin/users/${id}`, data)
} 

export const changePassword = async (id: number, data: { new_password: string }) => {
    await api.post(`/admin/users/${id}/update-password`, data)
} 

export const archiveUser = async (id: number) => {
    await api.post(`/admin/users/${id}/archive`)
} 

export const unArchiveUser = async (id: number) => {
    await api.post(`/admin/users/${id}/unarchive`)
} 