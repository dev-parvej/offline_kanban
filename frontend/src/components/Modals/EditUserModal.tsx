import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { User, UpdateUserData } from '../../types';

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (userId: number, userData: UpdateUserData) => Promise<void>;
  onDeactivateUser?: (userId: number) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onDeactivateUser
}) => {
  const { user: currentUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user.name,
    email: user.email,
    is_root: user.is_root,
    is_active: user.is_active
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when user or modal state changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        is_root: user.is_root,
        is_active: user.is_active
      });
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
    }
  }, [user, isOpen]);

  // Check if editing own profile
  const isEditingSelf = currentUser?.id === user.id;
  
  // Check if can edit admin status (only root users, but not themselves)
  const canEditAdminStatus = currentUser?.is_root && !isEditingSelf;

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only if changing password)
    if (newPassword) {
      if (newPassword.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Prevent making last admin non-admin
    if (user.is_root && !formData.is_root && !isEditingSelf) {
      // In a real app, check if this is the last admin
      // newErrors.is_root = 'Cannot remove admin status - must have at least one administrator';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: UpdateUserData = { ...formData };
      
      // Include password only if changing
      if (newPassword) {
        updateData.password = newPassword;
      }

      await onUpdateUser(user.id, updateData);
      onClose();
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to update user' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle deactivation
  const handleDeactivate = async () => {
    if (!onDeactivateUser) return;
    
    const action = user.is_active ? 'deactivate' : 'reactivate';
    const confirmed = confirm(
      `Are you sure you want to ${action} this user? ${
        user.is_active ? 'They will no longer be able to access the system.' : 'They will regain access to the system.'
      }`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await onDeactivateUser(user.id);
      onClose();
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : `Failed to ${action} user` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof UpdateUserData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditingSelf ? 'Edit Profile' : 'Edit User'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditingSelf ? 'Update your profile information' : `Update ${user.name}'s information`}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {/* User Status Warning */}
          {!user.is_active && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                <div className="text-sm text-yellow-700">
                  This user account is currently deactivated
                </div>
              </div>
            </div>
          )}

          {/* Avatar and Status */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar
                src={user.avatar_url}
                name={formData.name || user.name}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {user.name}
                </h3>
                {user.is_root && (
                  <Badge variant="warning" className="text-xs">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <Badge 
                  variant={user.is_active ? "success" : "secondary"} 
                  className="text-xs"
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                Created {new Date(user.created_at).toLocaleDateString()}
              </div>
              {user.last_login_at && (
                <div className="text-sm text-gray-500">
                  Last login {new Date(user.last_login_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              error={errors.name}
              className="w-full"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              error={errors.email}
              className="w-full"
            />
          </div>

          {/* Password Change Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Change Password
            </h4>
            
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  placeholder="Leave blank to keep current password"
                  error={errors.password}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            {newPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Administrator Permission */}
          {canEditAdminStatus && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Administrator Access
                    </div>
                    <div className="text-xs text-gray-500">
                      Grant full system access and user management permissions
                    </div>
                  </div>
                </div>
                <Switch
                  checked={formData.is_root || false}
                  onChange={(checked) => handleInputChange('is_root', checked)}
                />
              </div>
            </div>
          )}

          {/* Account Status */}
          {!isEditingSelf && onDeactivateUser && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Account Status
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.is_active ? 'User can access the system' : 'User cannot access the system'}
                  </div>
                </div>
                <Button
                  type="button"
                  variant={user.is_active ? "danger" : "success"}
                  onClick={handleDeactivate}
                  disabled={loading}
                >
                  {user.is_active ? 'Deactivate' : 'Reactivate'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};