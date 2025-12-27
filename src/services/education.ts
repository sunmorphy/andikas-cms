import api from './api';
import type { Education, ApiResponse } from '@/types';

export const educationService = {
    async getAll(): Promise<Education[]> {
        const response = await api.get<ApiResponse<Education[]>>('/education');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch education');
    },

    async getById(id: string): Promise<Education> {
        const response = await api.get<ApiResponse<Education>>(`/education/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch education');
    },

    async create(data: { year: string; institutionName: string; description?: string }): Promise<Education> {
        const response = await api.post<ApiResponse<Education>>('/education', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create education');
    },

    async update(id: string, data: { year: string; institutionName: string; description?: string }): Promise<Education> {
        const response = await api.put<ApiResponse<Education>>(`/education/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update education');
    },

    async delete(id: string): Promise<void> {
        const response = await api.delete<ApiResponse<void>>(`/education/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete education');
        }
    },
};
