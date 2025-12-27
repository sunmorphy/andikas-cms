import api from './api';
import type { Project, ApiResponse } from '@/types';

export const projectsService = {
    async getAll(): Promise<Project[]> {
        const response = await api.get<ApiResponse<Project[]>>('/projects');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch projects');
    },

    async getBySlug(slug: string): Promise<Project> {
        const response = await api.get<ApiResponse<Project>>(`/projects/${slug}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch project');
    },

    async create(data: FormData): Promise<Project> {
        const response = await api.post<ApiResponse<Project>>('/projects', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create project');
    },

    async update(id: string, data: FormData): Promise<Project> {
        const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update project');
    },

    async delete(id: string): Promise<void> {
        const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete project');
        }
    },
};
