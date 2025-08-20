import React, { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';
import { useTheme } from '../../contexts/ThemeContext';

interface AppConfig {
  appName: string;
  appDescription: string;
  defaultTheme: 'light' | 'dark' | 'system';
  enableNotifications: boolean;
  autoSaveInterval: number;
}

export const AppSettings: React.FC = () => {
  const { showToast, ToastContainer } = useToast();
  const { isDarkMode, toggleDarkMode, setDarkMode } = useTheme();
  
  // Mock data - will be replaced with API calls
  const [appConfig, setAppConfig] = useState<AppConfig>({
    appName: 'Offline Kanban',
    appDescription: 'A powerful offline-first Kanban board application',
    defaultTheme: 'system',
    enableNotifications: true,
    autoSaveInterval: 30
  });

  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: appConfig
  });

  const watchedTheme = watch('defaultTheme');

  const handleSaveSettings = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const updatedConfig: AppConfig = {
        appName: data.appName,
        appDescription: data.appDescription,
        defaultTheme: data.defaultTheme,
        enableNotifications: data.enableNotifications,
        autoSaveInterval: parseInt(data.autoSaveInterval)
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
      
      showToast("Settings saved successfully!", "success");
      
      // TODO: Save to backend/localStorage
      console.log('Saving app settings:', updatedConfig);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast("Failed to save settings. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaults: AppConfig = {
      appName: 'Offline Kanban',
      appDescription: 'A powerful offline-first Kanban board application',
      defaultTheme: 'system',
      enableNotifications: true,
      autoSaveInterval: 30
    };
    
    setAppConfig(defaults);
    // Reset form with new values
    Object.entries(defaults).forEach(([key, value]) => {
      document.getElementById(key)?.setAttribute('value', value.toString());
    });
    
    showToast("Settings reset to defaults!", "success");
  };

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

                <FormGroup label="Auto-save Interval" errorMessage={errors.autoSaveInterval?.message as string}>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="autoSaveInterval"
                      type="number"
                      min="5"
                      max="300"
                      className="w-20"
                      {...register("autoSaveInterval", {
                        required: "Auto-save interval is required",
                        min: { value: 5, message: "Minimum interval is 5 seconds" },
                        max: { value: 300, message: "Maximum interval is 300 seconds" }
                      })}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">seconds</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    How often changes are automatically saved (5-300 seconds).
                  </p>
                </FormGroup>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-between">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                Reset to Defaults
              </button>
              
              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Settings
                </Button>
              </div>
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
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Auto-save:</dt>
            <dd className="text-gray-900 dark:text-white font-medium">
              Every {appConfig.autoSaveInterval}s
            </dd>
          </div>
        </dl>
      </div>

      <ToastContainer />
    </div>
  );
};