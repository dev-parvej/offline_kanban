import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { UsersList } from '../components/Users/UsersList';
import { UserCreateModal } from '../components/Users/UserCreateModal';
import { UserEditModal } from '../components/Users/UserEditModal';
import { UserPasswordChangeModal } from '../components/Users/UserPasswordChangeModal';
import { UserArchiveConfirmModal } from '../components/Users/UserArchiveConfirmModal';

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

export const Users: React.FC = () => {
  // Mock data for development - will be replaced with API calls
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'John Smith',
      username: 'john@example.com',
      designation: 'Project Manager',
      is_root: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      is_active: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      username: 'sarah@example.com',
      designation: 'UI/UX Designer',
      is_root: false,
      created_at: '2024-01-20T14:15:00Z',
      updated_at: '2024-01-20T14:15:00Z',
      is_active: true
    },
    {
      id: 3,
      name: 'Michael Brown',
      username: 'michael@example.com',
      designation: 'Software Developer',
      is_root: false,
      created_at: '2024-02-01T09:00:00Z',
      updated_at: '2024-02-01T09:00:00Z',
      is_active: true
    },
    {
      id: 4,
      name: 'Emily Davis',
      username: 'emily@example.com',
      designation: '',
      is_root: false,
      created_at: '2024-02-10T16:45:00Z',
      updated_at: '2024-02-10T16:45:00Z',
      is_active: false
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCreateUser = async (userData: any) => {
    // TODO: Implement API call to create user
    console.log('Creating user:', userData);
    // Mock implementation - add to local state
    const newUser: User = {
      id: Date.now(), // Mock ID
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    // TODO: Implement API call to update user
    console.log('Updating user:', userData);
    // Mock implementation - update local state
    setUsers(prev => prev.map(user => 
      user.id === userData.id 
        ? { ...user, ...userData, updated_at: new Date().toISOString() }
        : user
    ));
  };

  const handlePasswordChange = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (passwordData: any) => {
    // TODO: Implement API call to change password
    console.log('Changing password:', passwordData);
    // In a real app, this would make an API call to update the password
    // For now, we'll just show success (no local state change needed for password)
  };

  const handleArchiveUser = (user: User) => {
    setSelectedUser(user);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async (user: User) => {
    // TODO: Implement API call to archive/unarchive user
    console.log('Confirm archive user:', user);
    // Mock implementation - toggle active status
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, is_active: !u.is_active, updated_at: new Date().toISOString() }
        : u
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-6 px-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Manage users and their permissions
            </p>
          </div>
          
          {/* Add User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>

        <UsersList
          users={users}
          onEdit={handleEditUser}
          onPasswordChange={handlePasswordChange}
          onArchive={handleArchiveUser}
        />
      </div>

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Modal */}
      <UserEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
      />

      {/* Password Change Modal */}
      <UserPasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdatePassword}
        user={selectedUser}
      />

      {/* Archive Confirmation Modal */}
      <UserArchiveConfirmModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmArchive}
        user={selectedUser}
      />
    </div>
  );
};