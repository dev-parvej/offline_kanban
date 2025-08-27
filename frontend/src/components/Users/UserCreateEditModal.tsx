import React, { useState, useEffect } from 'react';
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

interface UserCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  user?: User | null;
  mode: 'create' | 'edit';
}

export const UserCreateEditModal: React.FC<UserCreateEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast, ToastContainer } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const isEditMode = mode === 'edit';

  // Populate form with user data when in edit mode
  useEffect(() => {
    if (user && isOpen && isEditMode) {
      setValue('name', user.name);
      setValue('username', user.username);
      setValue('designation', user.designation || '');
      setValue('is_root', user.is_root);
    }
  }, [user, isOpen, isEditMode, setValue]);

  const saveUser = async (data: FieldValues) => {
    if (isEditMode && !user) return;

    setIsLoading(true);
    try {
      const userData = isEditMode 
        ? {
            id: user!.id,
            name: data.name,
            username: data.username,
            designation: data.designation || null,
            is_root: data.is_root || false
          }
        : {
            name: data.name,
            username: data.username,
            password: data.password,
            designation: data.designation || null,
            is_root: data.is_root || false
          };
      
      await onSubmit(userData);
      showToast(`User ${isEditMode ? 'updated' : 'created'} successfully!`, "success");
      reset();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (isEditMode && !user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="max-w-2xl w-full"
    >
      <div className="text-gray-900 dark:text-white">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {isEditMode ? 'Update user information and permissions' : 'Add a new user to the system'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(saveUser)} className="flex flex-col gap-4">
          
          {/* Name Field */}
          <FormGroup label="Full Name" errorMessage={errors.name?.message as string}>
            <Input 
              placeholder="Enter full name..."
              {...register("name", { 
                required: "Full name is required", 
                minLength: {
                  value: 2, 
                  message: "Name must be at least 2 characters long"
                }, 
                maxLength: {
                  value: 50, 
                  message: "Name must not exceed 50 characters"
                },
                pattern: {
                  value: /^[a-zA-Z\s\-']+$/,
                  message: "Name can only contain letters, spaces, hyphens, and apostrophes"
                }
              })}
            />
          </FormGroup>

          {/* Username Field */}
          { !isEditMode && <FormGroup label="Username/Email" errorMessage={errors.username?.message as string}>
            <Input 
              placeholder="Enter username or email..."
              {...register("username", { 
                required: "Username is required", 
                minLength: {
                  value: 3, 
                  message: "Username must be at least 3 characters long"
                }, 
                maxLength: {
                  value: 50, 
                  message: "Username must not exceed 50 characters"
                }
              })}
            />
          </FormGroup> }

          {/* Designation Field */}
          <FormGroup label="Designation (Optional)">
            <Input 
              placeholder="Enter job title or designation..."
              {...register("designation", {
                maxLength: {
                  value: 100,
                  message: "Designation must not exceed 100 characters"
                }
              })}
            />
          </FormGroup>

          {/* Password Fields - Only for Create Mode */}
          {!isEditMode && (
            <>
              <FormGroup label="Password" errorMessage={errors.password?.message as string}>
                <Input 
                  type="password"
                  placeholder="Enter password..."
                  {...register("password", { 
                    required: "Password is required", 
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

              <FormGroup label="Confirm Password" errorMessage={errors.confirmPassword?.message as string}>
                <Input 
                  type="password"
                  placeholder="Confirm password..."
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: (value, { password }) => {
                      return value === password || "Passwords do not match";
                    }
                  })}
                />
              </FormGroup>
            </>
          )}

          {/* Root User Checkbox */}
          <FormGroup label="">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`is_root_${mode}`}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                {...register("is_root")}
              />
              <label htmlFor={`is_root_${mode}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Grant root user permissions
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Root users can manage other users and have full system access.
            </p>
          </FormGroup>

          {/* User Info Display - Only for Edit Mode */}
          {isEditMode && user && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`ml-2 font-medium ${
                    user.is_active 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Archived'}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              {isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>

          <ToastContainer />
        </form>
      </div>
    </Modal>
  );
};