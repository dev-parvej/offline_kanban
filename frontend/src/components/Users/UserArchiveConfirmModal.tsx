import React, { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Modal } from '../ui/Modal/Modal';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';
import { ExclamationTriangleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

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

interface UserArchiveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: User) => void;
  user: User | null;
}

export const UserArchiveConfirmModal: React.FC<UserArchiveConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast, ToastContainer } = useToast();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const confirmationText = watch('confirmationText', '');
  const isArchiving = user?.is_active;
  const actionWord = isArchiving ? 'archive' : 'unarchive';
  const actionWordCapitalized = isArchiving ? 'ARCHIVE' : 'UNARCHIVE';

  const handleConfirm = async (data: FieldValues) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await onConfirm(user);
      showToast(
        `User ${isArchiving ? 'archived' : 'unarchived'} successfully!`, 
        "success"
      );
      reset();
      onClose();
    } catch (error) {
      console.error(`Error ${actionWord}ing user:`, error);
      showToast(`Failed to ${actionWord} user. Please try again.`, "error");
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
      className="max-w-md w-full"
    >
      <div className="text-gray-900 dark:text-white">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              isArchiving 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              {isArchiving ? (
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <ArchiveBoxIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">
            {isArchiving ? 'Archive User' : 'Unarchive User'}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
            {isArchiving 
              ? 'This will deactivate the user account'
              : 'This will reactivate the user account'
            }
          </p>
        </div>

        {/* User Info Card */}
        <div className={`border-2 rounded-lg p-4 mb-6 ${
          isArchiving 
            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' 
            : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
        }`}>
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
              {user.designation && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {user.designation}
                </div>
              )}
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

        {/* Warning Message */}
        <div className={`border rounded-lg p-4 mb-6 ${
          isArchiving
            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <span className={isArchiving ? 'text-yellow-400' : 'text-blue-400'}>
                {isArchiving ? '⚠️' : 'ℹ️'}
              </span>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                isArchiving 
                  ? 'text-yellow-800 dark:text-yellow-200' 
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {isArchiving ? 'Warning' : 'Information'}
              </h3>
              <div className={`mt-2 text-sm ${
                isArchiving 
                  ? 'text-yellow-700 dark:text-yellow-300' 
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {isArchiving ? (
                  <ul className="list-disc list-inside space-y-1">
                    <li>User will be logged out immediately</li>
                    <li>User will not be able to access the system</li>
                    <li>All user data will be preserved</li>
                    <li>This action can be reversed later</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>User will regain access to the system</li>
                    <li>All previous data will be restored</li>
                    <li>User will need to log in again</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleConfirm)} className="flex flex-col gap-4">
          
          {/* Confirmation Input */}
          <FormGroup 
            label={`Type "${actionWordCapitalized}" to confirm`} 
            errorMessage={errors.confirmationText?.message as string}
          >
            <Input 
              placeholder={`Type "${actionWordCapitalized}" here...`}
              autoComplete="off"
              {...register("confirmationText", { 
                required: `You must type "${actionWordCapitalized}" to confirm`,
                validate: (value) => {
                  return value.toUpperCase() === actionWordCapitalized || 
                         `You must type "${actionWordCapitalized}" exactly`;
                }
              })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This confirmation helps prevent accidental {actionWord} actions.
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
            <Button 
              type="submit" 
              isLoading={isLoading}
              disabled={confirmationText.toUpperCase() !== actionWordCapitalized}
              className={isArchiving ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isArchiving ? 'Archive User' : 'Unarchive User'}
            </Button>
          </div>

          <ToastContainer />
        </form>
      </div>
    </Modal>
  );
};