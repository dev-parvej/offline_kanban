import { api } from './axios';

export interface AppSettings {
  id: number;
  app_name: string;
  app_description?: string;
  default_theme: 'light' | 'dark' | 'system';
  enable_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsRequest {
  app_name: string;
  app_description?: string;
  default_theme: 'light' | 'dark' | 'system';
  enable_notifications: boolean;
}

export interface SettingsResponse {
  settings: AppSettings;
}

class SettingsService {
  
  // Get current application settings
  async getSettings(): Promise<AppSettings> {
    try {
      const response = await api.get<SettingsResponse>('/settings');
      return response.data.settings;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load settings';
      throw new Error(message);
    }
  }

  // Update application settings (admin only)
  async updateSettings(settingsData: UpdateSettingsRequest): Promise<AppSettings> {
    try {
      const response = await api.put<SettingsResponse>('/settings', settingsData);
      return response.data.settings;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update settings';
      throw new Error(message);
    }
  }
}

export const settingsService = new SettingsService();