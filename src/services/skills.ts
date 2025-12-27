import api from './api';
import type { Skill, ApiResponse } from '@/types';

export const skillsService = {
    async getAll(): Promise<Skill[]> {
        const response = await api.get<ApiResponse<Skill[]>>('/skills');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch skills');
    },

    async getById(id: string): Promise<Skill> {
        const response = await api.get<ApiResponse<Skill>>(`/skills/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch skill');
    },

    async create(data: FormData): Promise<Skill> {
        const response = await api.post<ApiResponse<Skill>>('/skills', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create skill');
    },

    async update(id: string, data: FormData): Promise<Skill> {
        const response = await api.put<ApiResponse<Skill>>(`/skills/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update skill');
    },

    async delete(id: string): Promise<void> {
        const response = await api.delete<ApiResponse<void>>(`/skills/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete skill');
        }
    },
};
