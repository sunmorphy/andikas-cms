import api from './api';
import type { Certification, ApiResponse } from '@/types';

interface CertificationCreateData {
    name: string;
    issuingOrganization: string;
    year: number;
    description?: string;
    certificateLink?: string;
    skillIds?: string[];
}

export const certificationsService = {
    async getAll(): Promise<Certification[]> {
        const response = await api.get<ApiResponse<Certification[]>>('/certifications');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch certifications');
    },

    async getById(id: string): Promise<Certification> {
        const response = await api.get<ApiResponse<Certification>>(`/certifications/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch certification');
    },

    async create(data: CertificationCreateData): Promise<Certification> {
        const response = await api.post<ApiResponse<Certification>>('/certifications', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create certification');
    },

    async update(id: string, data: CertificationCreateData): Promise<Certification> {
        const response = await api.put<ApiResponse<Certification>>(`/certifications/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update certification');
    },

    async delete(id: string): Promise<void> {
        const response = await api.delete<ApiResponse<void>>(`/certifications/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete certification');
        }
    },
};
