import React, { useState, useEffect } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';
import { useTheme } from '../../contexts/ThemeContext';
import { settingsService, AppSettings as ApiAppSettings } from '../../api';

interface AppConfig {
  appName: string;
  appDescription: string;
  defaultTheme: 'light' | 'dark' | 'system';
  enableNotifications: boolean;
}

export const AppSettings: React.FC = () => {
  const { showToast, ToastContainer } = useToast();
  const { isDarkMode, toggleDarkMode, setDarkMode } = useTheme();
  
  const [appConfig, setAppConfig] = useState<AppConfig>({
    appName: 'Offline Kanban',
    appDescription: 'A powerful offline-first Kanban board application',
    defaultTheme: 'system',
    enableNotifications: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: appConfig
  });

  const watchedTheme = watch('defaultTheme');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      const config: AppConfig = {
        appName: settings.app_name,
        appDescription: settings.app_description || '',
        defaultTheme: settings.default_theme,
        enableNotifications: settings.enable_notifications
      };
      
      setAppConfig(config);
      reset(config); // Reset form with loaded data
      
      // Update document title
      document.title = config.appName;
      
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast("Failed to load settings", "error");
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const handleSaveSettings = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const updateData = {
        app_name: data.appName,
        app_description: data.appDescription || undefined,
        default_theme: data.defaultTheme,
        enable_notifications: data.enableNotifications
      };
      
      const updatedSettings = await settingsService.updateSettings(updateData);
      
      const updatedConfig: AppConfig = {
        appName: updatedSettings.app_name,
        appDescription: updatedSettings.app_description || '',
        defaultTheme: updatedSettings.default_theme,
        enableNotifications: updatedSettings.enable_notifications
      };
      
      // Update local state
      setAppConfig(updatedConfig);
      
      // Apply theme change immediately
      if (data.defaultTheme === 'light') {
        setDarkMode(false);
      } else if (data.defaultTheme === 'dark') {
        setDarkMode(true);
      }
      // For 'system', the theme context will handle it automatically
      
      // Update document title
      document.title = updatedConfig.appName;
      
      showToast("Settings saved successfully!", "success");
      
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast(error.message || "Failed to save settings. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };


  // Show loading state while fetching initial settings
  if (isLoadingInitial) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            App Settings
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Configure your application preferences and behavior
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          App Settings
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Configure your application preferences and behavior
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <form onSubmit={handleSubmit(handleSaveSettings)} className="space-y-6">
            
            {/* App Identity Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                App Identity
              </h3>
              <div className="space-y-4">
                <FormGroup label="Application Name" errorMessage={errors.appName?.message as string}>
                  <Input
                    id="appName"
                    placeholder="Enter application name..."
                    {...register("appName", {
                      required: "App name is required",
                      minLength: { value: 2, message: "App name must be at least 2 characters" },
                      maxLength: { value: 50, message: "App name must not exceed 50 characters" }
                    })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This name will appear in the browser title and throughout the app.
                  </p>
                </FormGroup>

                <FormGroup label="Application Description">
                  <textarea
                    id="appDescription"
                    rows={3}
                    placeholder="Enter application description..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    {...register("appDescription", {
                      maxLength: { value: 200, message: "Description must not exceed 200 characters" }
                    })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Optional description for your Kanban application.
                  </p>
                </FormGroup>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="space-y-4">
                <FormGroup label="Default Theme">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="theme-system"
                        type="radio"
                        value="system"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        {...register("defaultTheme")}
                      />
                      <label htmlFor="theme-system" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">System</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Follow system preference (recommended)
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="theme-light"
                        type="radio"
                        value="light"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        {...register("defaultTheme")}
                      />
                      <label htmlFor="theme-light" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Light</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Always use light theme
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="theme-dark"
                        type="radio"
                        value="dark"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        {...register("defaultTheme")}
                      />
                      <label htmlFor="theme-dark" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Dark</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Always use dark theme
                        </span>
                      </label>
                    </div>
                  </div>
                  {watchedTheme && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                      Current selection: <strong>{watchedTheme.charAt(0).toUpperCase() + watchedTheme.slice(1)}</strong>
                    </div>
                  )}
                </FormGroup>
              </div>
            </div>

            {/* Behavior Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Behavior
              </h3>
              <div className="space-y-4">
                <FormGroup label="">
                  <div className="flex items-center">
                    <input
                      id="enableNotifications"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      {...register("enableNotifications")}
                    />
                    <label htmlFor="enableNotifications" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Enable Notifications</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        Show notifications for important events and updates
                      </span>
                    </label>
                  </div>
                </FormGroup>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-between">
              <Button 
                type="submit" 
                isLoading={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Settings
              </Button>
            </div>

          </form>
        </div>
      </div>

      {/* Current Settings Preview */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Current Settings Preview
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">App Name:</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{appConfig.appName}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Theme:</dt>
            <dd className="text-gray-900 dark:text-white font-medium">
              {appConfig.defaultTheme.charAt(0).toUpperCase() + appConfig.defaultTheme.slice(1)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Notifications:</dt>
            <dd className="text-gray-900 dark:text-white font-medium">
              {appConfig.enableNotifications ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
        </dl>
      </div>

      <ToastContainer />
    </div>
  );
};