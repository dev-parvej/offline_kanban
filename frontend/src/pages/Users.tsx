import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { UsersList } from '../components/Users/UsersList';
import { UserPasswordChangeModal } from '../components/Users/UserPasswordChangeModal';
import { UserArchiveConfirmModal } from '../components/Users/UserArchiveConfirmModal';
import { UserCreateEditModal } from '../components/Users/UserCreateEditModal';
import { api, saveUser, User, updateUser, changePassword, archiveUser, unArchiveUser } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { clearAuthTokens } from '../utils/cookieUtils';
import { useNavigate } from 'react-router-dom';

export const Users: React.FC = () => {
  // Mock data for development - will be replaced with API calls
  const [users, setUsers] = useState<User[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [ isLoading, setIsLoading ] = useState(false)
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateUser = async (userData: any) => {
    await saveUser(userData);
    getUsers()
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    await updateUser(selectedUser?.id as number, userData)
    getUsers();
  };

  const handlePasswordChange = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (passwordData: any) => {
    await changePassword(passwordData.userId, { new_password: passwordData.newPassword });

    if (user?.id === passwordData.userId) {
      clearAuthTokens()
      navigate("/login")
    }
  };

  const handleArchiveUnarchiveUser = (user: User) => {
    setSelectedUser(user);
    setShowArchiveModal(true);
  };

  const handleConfirmArchiveUnarchive = async (user: User) => {
    if(user.is_active) {
      await archiveUser(user.id);
      getUsers()
    } else {
      await unArchiveUser(user.id)
      getUsers();
    }
  };

  const getUsers = async () => {
    setIsLoading(true)
    const { data } = await api.get('/admin/users');
    setIsLoading(false)
    setUsers(data);
  }

  useEffect(() => {
    getUsers();
  }, [])

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
          {isLoading ? 'Loading...': <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>}
        </div>

        <UsersList
          users={users}
          onEdit={handleEditUser}
          onPasswordChange={handlePasswordChange}
          onArchiveUnarchiveAction={handleArchiveUnarchiveUser}
        />
      </div>

      {/* Create User Modal */}
      <UserCreateEditModal
        mode='create'
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Modal */}
      <UserCreateEditModal
        mode="edit"
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
        onConfirm={handleConfirmArchiveUnarchive}
        user={selectedUser}
      />
    </div>
  );
};