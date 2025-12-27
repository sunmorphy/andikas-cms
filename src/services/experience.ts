import api from './api';
import type { Experience, ApiResponse } from '@/types';

interface ExperienceCreateData {
    startYear: number;
    endYear: number | null;
    companyName: string;
    description?: string;
    location: string;
    skillIds?: string[];
}

export const experienceService = {
    async getAll(): Promise<Experience[]> {
        const response = await api.get<ApiResponse<Experience[]>>('/experience');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch experience');
    },

    async getById(id: string): Promise<Experience> {
        const response = await api.get<ApiResponse<Experience>>(`/experience/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch experience');
    },

    async create(data: ExperienceCreateData): Promise<Experience> {
        const response = await api.post<ApiResponse<Experience>>('/experience', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create experience');
    },

    async update(id: string, data: ExperienceCreateData): Promise<Experience> {
        const response = await api.put<ApiResponse<Experience>>(`/experience/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update experience');
    },

    async delete(id: string): Promise<void> {
        const response = await api.delete<ApiResponse<void>>(`/experience/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete experience');
        }
    },
};
