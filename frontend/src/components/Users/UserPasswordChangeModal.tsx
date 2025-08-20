import React, { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Modal } from '../ui/Modal/Modal';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';

interface User {
  id: number;
  name: string;
  username: string;
  designation?: string;
  is_root: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface UserPasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passwordData: any) => void;
  user: User | null;
}

export const UserPasswordChangeModal: React.FC<UserPasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast, ToastContainer } = useToast();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const newPassword = watch('newPassword');

  const changePassword = async (data: FieldValues) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const passwordData = {
        userId: user.id,
        newPassword: data.newPassword
      };
      
      await onSubmit(passwordData);
      showToast("Password updated successfully!", "success");
      reset();
      onClose();
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("Failed to update password. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="max-w-lg w-full"
    >
      <div className="text-gray-900 dark:text-white">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Change Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Update password for <span className="font-medium">{user.name}</span>
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {user.name
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase())
                    .join('')
                    .substring(0, 2)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.username}
              </div>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.is_root
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {user.is_root ? 'Root' : 'Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(changePassword)} className="flex flex-col gap-4">
          
          {/* New Password Field */}
          <FormGroup label="New Password" errorMessage={errors.newPassword?.message as string}>
            <Input 
              type="password"
              placeholder="Enter new password..."
              {...register("newPassword", { 
                required: "New password is required", 
                minLength: {
                  value: 8, 
                  message: "Password must be at least 8 characters long"
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                }
              })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters with uppercase, lowercase, and number.
            </p>
          </FormGroup>

          {/* Confirm New Password Field */}
          <FormGroup label="Confirm New Password" errorMessage={errors.confirmNewPassword?.message as string}>
            <Input 
              type="password"
              placeholder="Confirm new password..."
              {...register("confirmNewPassword", { 
                required: "Please confirm the new password",
                validate: (value) => {
                  return value === newPassword || "Passwords do not match";
                }
              })}
            />
          </FormGroup>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Password Requirements:
              </h4>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center ${
                  newPassword.length >= 8 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span className="mr-2">{newPassword.length >= 8 ? '✓' : '○'}</span>
                  At least 8 characters
                </div>
                <div className={`flex items-center ${
                  /[a-z]/.test(newPassword) 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span className="mr-2">{/[a-z]/.test(newPassword) ? '✓' : '○'}</span>
                  At least one lowercase letter
                </div>
                <div className={`flex items-center ${
                  /[A-Z]/.test(newPassword) 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span className="mr-2">{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span>
                  At least one uppercase letter
                </div>
                <div className={`flex items-center ${
                  /\d/.test(newPassword) 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span className="mr-2">{/\d/.test(newPassword) ? '✓' : '○'}</span>
                  At least one number
                </div>
              </div>
            </div>
          )}

          {/* Security Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Security Notice
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  The user will be required to log in again with their new password. Make sure to inform them of this change.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={isLoading}>
              Update Password
            </Button>
          </div>

          <ToastContainer />
        </form>
      </div>
    </Modal>
  );
};