import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { UserTable } from '../components/Users/UserTable';
import { UserCard } from '../components/Users/UserCard';
import { UserFilters } from '../components/Users/UserFilters';
import { CreateUserModal } from '../components/Modals/CreateUserModal';
import { EditUserModal } from '../components/Modals/EditUserModal';
import { UserDetailsModal } from '../components/Modals/UserDetailsModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { User, UserFilters as FilterType } from '../types';

export const UserListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    filters,
    totalCount,
    loading,
    updateFilters,
    createUser,
    updateUser,
    deactivateUser,
    activateUser
  } = useUsers();

  // UI State
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState(filters.searchText || '');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'root'>('all');
  
  // Modal States
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Redirect non-root users
  useEffect(() => {
    if (currentUser && !currentUser.is_root) {
      // In a real app, you'd redirect to unauthorized page or dashboard
      console.warn('Access denied: Only root users can access user management');
    }
  }, [currentUser]);

  // Search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      updateFilters({ ...filters, searchText: searchQuery });
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Filter users by tab
  const getFilteredUsers = () => {
    switch (activeTab) {
      case 'active':
        return users.filter(user => user.is_active);
      case 'inactive':
        return users.filter(user => !user.is_active);
      case 'root':
        return users.filter(user => user.is_root);
      default:
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();
  const activeUserCount = users.filter(u => u.is_active).length;
  const inactiveUserCount = users.filter(u => !u.is_active).length;
  const rootUserCount = users.filter(u => u.is_root).length;

  // Handle user actions
  const handleCreateUser = async (userData: any) => {
    await createUser(userData);
    setShowCreateUser(false);
  };

  const handleUpdateUser = async (userId: number, userData: any) => {
    await updateUser(userId, userData);
    setEditingUser(null);
  };

  const handleToggleUserStatus = async (user: User) => {
    if (user.is_active) {
      await deactivateUser(user.id);
    } else {
      await activateUser(user.id);
    }
  };

  // Get active filter count
  const activeFilterCount = [
    filters.roleFilter && filters.roleFilter !== 'all',
    filters.statusFilter && filters.statusFilter !== 'all',
    filters.searchText?.length > 0
  ].filter(Boolean).length;

  // Export functionality
  const handleExport = () => {
    const dataToExport = filteredUsers.map(user => ({
      name: user.name,
      username: user.username,
      role: user.is_root ? 'Root' : 'Normal',
      status: user.is_active ? 'Active' : 'Inactive',
      created_at: new Date(user.created_at).toLocaleDateString()
    }));

    const csv = [
      ['Name', 'Username', 'Role', 'Status', 'Created'],
      ...dataToExport.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prevent access for non-root users
  if (!currentUser?.is_root) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500">
            Only root users can access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              User Management
            </h1>
            <Badge variant="secondary" className="text-sm">
              {totalCount} users
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 p-1">
              <Button
                variant={viewMode === 'table' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3"
              >
                <UserGroupIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="primary"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              onClick={handleExport}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>

            {/* Create User */}
            <Button
              variant="primary"
              onClick={() => setShowCreateUser(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <UserFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <span>All</span>
              <Badge variant="secondary" className="text-xs">
                {users.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <span>Active</span>
              <Badge variant="secondary" className="text-xs">
                {activeUserCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center space-x-2">
              <span>Inactive</span>
              <Badge variant="secondary" className="text-xs">
                {inactiveUserCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="root" className="flex items-center space-x-2">
              <span>Root</span>
              <Badge variant="secondary" className="text-xs">
                {rootUserCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <UserGroupIcon className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {activeFilterCount > 0 ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-sm mb-4">
              {activeFilterCount > 0 
                ? 'Try adjusting your filters or search terms'
                : 'Create your first user to get started'
              }
            </p>
            {activeFilterCount === 0 && (
              <Button
                variant="primary"
                onClick={() => setShowCreateUser(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <Tabs value={activeTab}>
              <TabsContent value="all" className="mt-0">
                {viewMode === 'table' ? (
                  <UserTable
                    users={filteredUsers}
                    onEditUser={setEditingUser}
                    onViewUser={setViewingUser}
                    onToggleStatus={handleToggleUserStatus}
                    currentUserId={currentUser.id}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onEdit={setEditingUser}
                          onView={setViewingUser}
                          onToggleStatus={handleToggleUserStatus}
                          canEdit={user.id !== currentUser.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="active" className="mt-0">
                {viewMode === 'table' ? (
                  <UserTable
                    users={filteredUsers}
                    onEditUser={setEditingUser}
                    onViewUser={setViewingUser}
                    onToggleStatus={handleToggleUserStatus}
                    currentUserId={currentUser.id}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onEdit={setEditingUser}
                          onView={setViewingUser}
                          onToggleStatus={handleToggleUserStatus}
                          canEdit={user.id !== currentUser.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inactive" className="mt-0">
                {viewMode === 'table' ? (
                  <UserTable
                    users={filteredUsers}
                    onEditUser={setEditingUser}
                    onViewUser={setViewingUser}
                    onToggleStatus={handleToggleUserStatus}
                    currentUserId={currentUser.id}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onEdit={setEditingUser}
                          onView={setViewingUser}
                          onToggleStatus={handleToggleUserStatus}
                          canEdit={user.id !== currentUser.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="root" className="mt-0">
                {viewMode === 'table' ? (
                  <UserTable
                    users={filteredUsers}
                    onEditUser={setEditingUser}
                    onViewUser={setViewingUser}
                    onToggleStatus={handleToggleUserStatus}
                    currentUserId={currentUser.id}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onEdit={setEditingUser}
                          onView={setViewingUser}
                          onToggleStatus={handleToggleUserStatus}
                          canEdit={user.id !== currentUser.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateUser && (
        <CreateUserModal
          isOpen={showCreateUser}
          onClose={() => setShowCreateUser(false)}
          onSuccess={handleCreateUser}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={(userData) => handleUpdateUser(editingUser.id, userData)}
        />
      )}

      {viewingUser && (
        <UserDetailsModal
          user={viewingUser}
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={() => {
            setEditingUser(viewingUser);
            setViewingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserListPage;