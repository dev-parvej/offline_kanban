import React, { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Modal } from '../ui/Modal/Modal';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast, ToastContainer } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const saveUser = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const userData = {
        name: data.name,
        username: data.username,
        password: data.password,
        designation: data.designation || null,
        is_root: data.is_root || false
      };
      
      await onSubmit(userData);
      showToast("User created successfully!", "success");
      reset();
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      showToast("Failed to create user. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
            Create New User
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Add a new user to the system
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
          <FormGroup label="Username/Email" errorMessage={errors.username?.message as string}>
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
          </FormGroup>

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

          {/* Password Field */}
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

          {/* Confirm Password Field */}
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

          {/* Root User Checkbox */}
          <FormGroup label="">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_root"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                {...register("is_root")}
              />
              <label htmlFor="is_root" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Grant root user permissions
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Root users can manage other users and have full system access.
            </p>
          </FormGroup>

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
              Create User
            </Button>
          </div>

          <ToastContainer />
        </form>
      </div>
    </Modal>
  );
};