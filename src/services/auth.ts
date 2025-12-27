import api from './api';
import type { User, LoginCredentials, RegisterData, ApiResponse } from '@/types';
import { AxiosError } from 'axios';

export const authService = {
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        try {
            const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
            if (response.data.success && response.data.data) {
                const { user, token } = response.data.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { user, token };
            }
            throw new Error(response.data.error || 'Login failed');
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                const errorMessage = error.response.data.error || error.response.data.message || 'Login failed';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },


    async register(data: RegisterData): Promise<{ user: User; token: string }> {
        try {
            const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
            if (response.data.success && response.data.data) {
                const { user, token } = response.data.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { user, token };
            }
            throw new Error(response.data.error || 'Registration failed');
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                const errorMessage = error.response.data.error || error.response.data.message || 'Registration failed';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    async getMe(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        if (response.data.success && response.data.data) {
            localStorage.setItem('user', JSON.stringify(response.data.data));
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get user');
    },

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getStoredToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    },
};
