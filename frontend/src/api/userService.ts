import { User } from "./authService";
import { api } from "./axios";

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