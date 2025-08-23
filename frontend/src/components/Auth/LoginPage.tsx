import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hook';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const { showToast, ToastContainer } = useToast();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      await login(data);
      showToast('Login successful!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4">
            <img 
              src="/logo-universal.png" 
              alt="Kanban Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome Back
          </h2>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Sign in to your Kanban workspace
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Username Field */}
          <FormGroup 
            label="Username" 
            errorMessage={errors.username?.message}
          >
            <Input
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                }
              })}
            />
          </FormGroup>

          {/* Password Field */}
          <FormGroup 
            label="Password" 
            errorMessage={errors.password?.message}
          >
            <Input
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
          </FormGroup>

          {/* Login Button */}
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Contact your administrator to create an account
          </p>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};