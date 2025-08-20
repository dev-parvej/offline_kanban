import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTaskList } from '../hooks/useTaskList';
import { useAuth } from '../hooks/useAuth';
import { TaskListTable } from '../components/TaskList/TaskListTable';
import { TaskListFilters } from '../components/TaskList/TaskListFilters';
import { TaskListCard } from '../components/TaskList/TaskListCard';
import { CreateTaskModal } from '../components/Modals/CreateTaskModal';
import { TaskModal } from '../components/Modals/TaskModal';
import { BulkActionsBar } from '../components/TaskList/BulkActionsBar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Checkbox } from '../components/ui/Checkbox';
import { Pagination } from '../components/ui/Pagination';
import { TaskListFilters as FilterType, Task } from '../types';

export const TaskListPage: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    filters,
    totalCount,
    currentPage,
    pageSize,
    loading,
    updateFilters,
    searchTasks,
    moveTask,
    assignTask,
    archiveTask,
    bulkUpdate,
    setCurrentPage
  } = useTaskList();

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState(filters.searchText || '');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [sortOrder, setSortOrder] = useState(filters.sortOrder);

  // Search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      updateFilters({ ...filters, searchText: searchQuery, offset: 0 });
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Handle sorting
  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    updateFilters({ ...filters, sortBy: field, sortOrder: newSortOrder });
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedTasks(checked ? tasks.map(task => task.id) : []);
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  // Bulk actions
  const handleBulkAssign = async (assigneeId: number | null) => {
    if (!user?.is_root) return;
    await bulkUpdate(selectedTasks, { assigned_to: assigneeId });
    setSelectedTasks([]);
  };

  const handleBulkMove = async (columnId: number) => {
    if (!user?.is_root) return;
    await bulkUpdate(selectedTasks, { column_id: columnId });
    setSelectedTasks([]);
  };

  const handleBulkArchive = async () => {
    if (!user?.is_root) return;
    await bulkUpdate(selectedTasks, { status: 'archived' });
    setSelectedTasks([]);
  };

  // Export functionality
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export tasks:', selectedTasks.length > 0 ? selectedTasks : 'all');
  };

  // Get active filter count
  const activeFilterCount = [
    filters.assigneeId !== undefined,
    filters.creatorId !== undefined,
    filters.columnId !== undefined,
    filters.priority !== undefined,
    filters.status !== undefined,
    filters.dateFrom !== undefined,
    filters.dateTo !== undefined,
    filters.searchText?.length > 0
  ].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              All Tasks
            </h1>
            <Badge variant="secondary" className="text-sm">
              {totalCount.toLocaleString()} tasks
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks, comments, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
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
                <ListBulletIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3"
              >
                <Squares2X2Icon className="h-4 w-4" />
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

            {/* Create Task */}
            <Button
              variant="primary"
              onClick={() => setShowCreateTask(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <TaskListFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && user?.is_root && (
        <BulkActionsBar
          selectedCount={selectedTasks.length}
          onAssign={handleBulkAssign}
          onMove={handleBulkMove}
          onArchive={handleBulkArchive}
          onClear={() => setSelectedTasks([])}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ListBulletIcon className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-sm mb-4">
              {activeFilterCount > 0 
                ? 'Try adjusting your filters or search terms'
                : 'Create your first task to get started'
              }
            </p>
            {activeFilterCount === 0 && (
              <Button
                variant="primary"
                onClick={() => setShowCreateTask(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {viewMode === 'table' ? (
              <TaskListTable
                tasks={tasks}
                selectedTasks={selectedTasks}
                sortBy={sortBy}
                sortOrder={sortOrder}
                canManage={user?.is_root || false}
                onTaskClick={setSelectedTask}
                onSelectTask={handleSelectTask}
                onSelectAll={handleSelectAll}
                onSort={handleSort}
                onMoveTask={user?.is_root ? moveTask : undefined}
                onAssignTask={user?.is_root ? assignTask : undefined}
                onArchiveTask={user?.is_root ? archiveTask : undefined}
              />
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tasks.map((task) => (
                    <TaskListCard
                      key={task.id}
                      task={task}
                      isSelected={selectedTasks.includes(task.id)}
                      canManage={user?.is_root || false}
                      onTaskClick={setSelectedTask}
                      onSelect={(checked) => handleSelectTask(task.id, checked)}
                      onMoveTask={user?.is_root ? moveTask : undefined}
                      onAssignTask={user?.is_root ? assignTask : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of{' '}
              {totalCount.toLocaleString()} results
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / pageSize)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => {
            setShowCreateTask(false);
            // Refresh handled by useTaskList
          }}
          defaultColumn={null}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            // Refresh handled by useTaskList
          }}
          canEdit={user?.is_root || selectedTask.created_by === user?.id}
        />
      )}
    </div>
  );
};

export default TaskListPage;