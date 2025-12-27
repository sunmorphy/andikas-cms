import api from './api';
import type { UserDetails, ApiResponse } from '@/types';

interface UserDetailsData {
    name: string;
    role: string;
    description: string;
    socialMedias: string[];
    profilePhoto?: string;
}

export const userDetailsService = {
    async get(): Promise<UserDetails | null> {
        const response = await api.get<ApiResponse<UserDetails>>('/user');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return null;
    },

    async create(data: FormData): Promise<UserDetails> {
        const response = await api.post<ApiResponse<UserDetails>>('/user', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create user details');
    },

    async update(data: FormData): Promise<UserDetails> {
        const response = await api.put<ApiResponse<UserDetails>>('/user', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update user details');
    },
};
