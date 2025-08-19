import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  RectangleStackIcon,
  ArchiveBoxIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useColumns } from '../hooks/useColumns';
import { useAuth } from '../hooks/useAuth';
import { ColumnTable } from '../components/Columns/ColumnTable';
import { ColumnCard } from '../components/Columns/ColumnCard';
import { ColumnFilters } from '../components/Columns/ColumnFilters';
import { SortableColumnItem } from '../components/Columns/SortableColumnItem';
import { CreateColumnModal } from '../components/Modals/CreateColumnModal';
import { EditColumnModal } from '../components/Modals/EditColumnModal';
import { ColumnDetailsModal } from '../components/Modals/ColumnDetailsModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Column, ColumnFilters as FilterType } from '../types';

export const ColumnListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    columns,
    archivedColumns,
    filters,
    totalCount,
    loading,
    updateFilters,
    createColumn,
    updateColumn,
    archiveColumn,
    unarchiveColumn,
    reorderColumns
  } = useColumns();

  // UI State
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'reorder'>('table');
  const [searchQuery, setSearchQuery] = useState(filters.searchText || '');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  
  // Modal States
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [viewingColumn, setViewingColumn] = useState<Column | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Redirect non-root users
  useEffect(() => {
    if (currentUser && !currentUser.is_root) {
      console.warn('Access denied: Only root users can access column management');
    }
  }, [currentUser]);

  // Search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      updateFilters({ ...filters, searchText: searchQuery });
    }, 300);

    return () => clearTimeout delayedSearch);
  }, [searchQuery]);

  // Get current columns based on active tab
  const getCurrentColumns = () => {
    return activeTab === 'active' ? columns : archivedColumns;
  };

  const currentColumns = getCurrentColumns();
  const activeColumnCount = columns.length;
  const archivedColumnCount = archivedColumns.length;

  // Handle column actions
  const handleCreateColumn = async (columnData: any) => {
    await createColumn(columnData);
    setShowCreateColumn(false);
  };

  const handleUpdateColumn = async (columnId: number, columnData: any) => {
    await updateColumn(columnId, columnData);
    setEditingColumn(null);
  };

  const handleArchiveColumn = async (column: Column) => {
    if (column.task_count && column.task_count > 0) {
      // In a real app, show confirmation modal about moving tasks
      const confirmed = confirm(
        `This column contains ${column.task_count} tasks. These tasks will be moved to the first column. Continue?`
      );
      if (!confirmed) return;
    }
    
    await archiveColumn(column.id);
  };

  const handleUnarchiveColumn = async (column: Column) => {
    await unarchiveColumn(column.id);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over?.id);
      
      const newOrder = arrayMove(columns, oldIndex, newIndex);
      reorderColumns(newOrder.map(col => col.id));
    }
  };

  // Get active filter count
  const activeFilterCount = [
    filters.hasTasksFilter !== 'all',
    filters.colorFilter,
    filters.searchText?.length > 0
  ].filter(Boolean).length;

  // Prevent access for non-root users
  if (!currentUser?.is_root) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RectangleStackIcon className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500">
            Only root users can manage board columns.
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
              Column Management
            </h1>
            <Badge variant="secondary" className="text-sm">
              {totalCount} columns
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search columns..."
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
                title="Table view"
              >
                <ListBulletIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3"
                title="Card view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'reorder' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('reorder')}
                className="px-3"
                title="Reorder view"
                disabled={activeTab === 'archived'}
              >
                <ArrowsUpDownIcon className="h-4 w-4" />
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

            {/* Create Column */}
            <Button
              variant="primary"
              onClick={() => setShowCreateColumn(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Column
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <ColumnFilters
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
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <RectangleStackIcon className="h-4 w-4" />
              <span>Active</span>
              <Badge variant="secondary" className="text-xs">
                {activeColumnCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center space-x-2">
              <ArchiveBoxIcon className="h-4 w-4" />
              <span>Archived</span>
              <Badge variant="secondary" className="text-xs">
                {archivedColumnCount}
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
        ) : currentColumns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <RectangleStackIcon className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {activeTab === 'active' 
                ? (activeFilterCount > 0 ? 'No columns found' : 'No columns yet')
                : 'No archived columns'
              }
            </h3>
            <p className="text-sm mb-4">
              {activeTab === 'active'
                ? (activeFilterCount > 0 
                    ? 'Try adjusting your filters or search terms'
                    : 'Create your first column to organize tasks'
                  )
                : 'Archived columns will appear here'
              }
            </p>
            {activeTab === 'active' && activeFilterCount === 0 && (
              <Button
                variant="primary"
                onClick={() => setShowCreateColumn(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Column
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <Tabs value={activeTab}>
              <TabsContent value="active" className="mt-0">
                {viewMode === 'reorder' ? (
                  <div className="p-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Reorder Columns
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Drag and drop columns to change their order on the board. 
                        Changes are saved automatically.
                      </p>
                    </div>
                    
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={columns.map(col => col.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 max-w-2xl">
                          {columns.map((column, index) => (
                            <SortableColumnItem
                              key={column.id}
                              column={column}
                              index={index}
                              onView={setViewingColumn}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                ) : viewMode === 'table' ? (
                  <ColumnTable
                    columns={currentColumns}
                    onEditColumn={setEditingColumn}
                    onViewColumn={setViewingColumn}
                    onArchiveColumn={handleArchiveColumn}
                    onUnarchiveColumn={handleUnarchiveColumn}
                    isArchivedTab={activeTab === 'archived'}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentColumns.map((column) => (
                        <ColumnCard
                          key={column.id}
                          column={column}
                          onEdit={setEditingColumn}
                          onView={setViewingColumn}
                          onArchive={handleArchiveColumn}
                          onUnarchive={handleUnarchiveColumn}
                          isArchived={activeTab === 'archived'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="archived" className="mt-0">
                {viewMode === 'table' ? (
                  <ColumnTable
                    columns={currentColumns}
                    onEditColumn={setEditingColumn}
                    onViewColumn={setViewingColumn}
                    onArchiveColumn={handleArchiveColumn}
                    onUnarchiveColumn={handleUnarchiveColumn}
                    isArchivedTab={true}
                  />
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentColumns.map((column) => (
                        <ColumnCard
                          key={column.id}
                          column={column}
                          onEdit={setEditingColumn}
                          onView={setViewingColumn}
                          onArchive={handleArchiveColumn}
                          onUnarchive={handleUnarchiveColumn}
                          isArchived={true}
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
      {showCreateColumn && (
        <CreateColumnModal
          isOpen={showCreateColumn}
          onClose={() => setShowCreateColumn(false)}
          onSuccess={handleCreateColumn}
        />
      )}

      {editingColumn && (
        <EditColumnModal
          column={editingColumn}
          isOpen={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          onSuccess={(columnData) => handleUpdateColumn(editingColumn.id, columnData)}
        />
      )}

      {viewingColumn && (
        <ColumnDetailsModal
          column={viewingColumn}
          isOpen={!!viewingColumn}
          onClose={() => setViewingColumn(null)}
          onEdit={() => {
            setEditingColumn(viewingColumn);
            setViewingColumn(null);
          }}
          onArchive={() => {
            if (viewingColumn.is_archived) {
              handleUnarchiveColumn(viewingColumn);
            } else {
              handleArchiveColumn(viewingColumn);
            }
            setViewingColumn(null);
          }}
        />
      )}
    </div>
  );
};

export default ColumnListPage;