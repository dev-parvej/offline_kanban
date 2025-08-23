import { api } from './axios';
import { setAuthTokens, clearAuthTokens } from '../utils/cookieUtils';

export interface User {
  id: string;
  username: string;
  name?: string;
  is_root: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

class AuthService {
  
  // Login user with username and password
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens in cookies
      setAuthTokens(access_token, refresh_token);
      
      // Store user data in localStorage
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/register', userData);
      
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens in cookies
      setAuthTokens(access_token, refresh_token);
      
      // Store user data in localStorage
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  }

  // Verify current session
  async verifySession(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/auth/verify');
      
      const user = response.data.user;
      
      // Update user data in localStorage
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Notify server to invalidate tokens
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    }
    
    // Clear tokens and user data
    clearAuthTokens();
    localStorage.removeItem('user_data');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user_data');
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put<{ user: User }>('/auth/profile', updates);
      
      const user = response.data.user;
      
      // Update user data in localStorage
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  }
}

export const authService = new AuthService();