import React, { useState } from 'react';
import { 
  EyeIcon,
  PencilIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  RectangleStackIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Column } from '../../types';

interface ColumnTableProps {
  columns: Column[];
  onEditColumn: (column: Column) => void;
  onViewColumn: (column: Column) => void;
  onArchiveColumn: (column: Column) => void;
  onUnarchiveColumn: (column: Column) => void;
  isArchivedTab: boolean;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (field: string) => void;
}

export const ColumnTable: React.FC<ColumnTableProps> = ({
  columns,
  onEditColumn,
  onViewColumn,
  onArchiveColumn,
  onUnarchiveColumn,
  isArchivedTab,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSort
}) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Sort header component
  const SortHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className={`
        px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
        ${onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
      `}
      onClick={() => onSort && onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {onSort && sortBy === field && (
          sortOrder === 'asc' ? 
            <ChevronUpIcon className="h-3 w-3" /> : 
            <ChevronDownIcon className="h-3 w-3" />
        )}
      </div>
    </th>
  );

  // Toggle row expansion
  const toggleRowExpansion = (columnId: number) => {
    setExpandedRows(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Get position badge
  const getPositionBadge = (column: Column, index: number) => {
    if (index === 0) {
      return <Badge variant="primary" className="text-xs">First</Badge>;
    }
    if (index === columns.length - 1 && !isArchivedTab) {
      return <Badge variant="secondary" className="text-xs">Last</Badge>;
    }
    return <Badge variant="outline" className="text-xs">#{index + 1}</Badge>;
  };

  // Get task count display
  const getTaskCountDisplay = (column: Column) => {
    const taskCount = column.task_count || 0;
    const completedCount = column.completed_task_count || 0;
    
    if (taskCount === 0) {
      return <span className="text-gray-400">No tasks</span>;
    }
    
    return (
      <div className="flex items-center space-x-2">
        <span className="font-medium">{taskCount}</span>
        {completedCount > 0 && (
          <span className="text-green-600 text-sm">
            ({completedCount} completed)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Expand Column */}
              <th className="px-2 py-3 w-8"></th>
              
              {/* Color Indicator */}
              <th className="px-3 py-3 w-12"></th>
              
              {/* Column Details */}
              <SortHeader field="title">Column</SortHeader>
              {!isArchivedTab && (
                <SortHeader field="position">Position</SortHeader>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks
              </th>
              <SortHeader field="created_by">Created By</SortHeader>
              <SortHeader field="created_at">Created</SortHeader>
              {isArchivedTab && (
                <SortHeader field="archived_at">Archived</SortHeader>
              )}
              
              {/* Actions */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {columns.map((column, index) => {
              const isExpanded = expandedRows.includes(column.id);
              
              return (
                <React.Fragment key={column.id}>
                  {/* Main Row */}
                  <tr className={`
                    hover:bg-gray-50 transition-colors
                    ${isArchivedTab ? 'opacity-75' : ''}
                  `}>
                    {/* Expand Button */}
                    <td className="px-2 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(column.id)}
                        className="p-1"
                      >
                        {isExpanded ? 
                          <ChevronDownIcon className="h-3 w-3" /> : 
                          <ChevronUpIcon className="h-3 w-3" />
                        }
                      </Button>
                    </td>

                    {/* Color Indicator */}
                    <td className="px-3 py-4">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: column.color }}
                        title={`Color: ${column.color}`}
                      />
                    </td>

                    {/* Column Info */}
                    <td className="px-6 py-4">
                      <div 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => onViewColumn(column)}
                      >
                        <div className="font-medium text-gray-900">
                          {column.title}
                        </div>
                        {column.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                            {column.description}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Position */}
                    {!isArchivedTab && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPositionBadge(column, index)}
                      </td>
                    )}

                    {/* Task Count */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <RectangleStackIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {getTaskCountDisplay(column)}
                      </div>
                    </td>

                    {/* Created By */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {column.created_by_user?.name || 'Unknown'}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(column.created_at).toLocaleDateString()}
                    </td>

                    {/* Archived Date */}
                    {isArchivedTab && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {column.archived_at 
                          ? new Date(column.archived_at).toLocaleDateString()
                          : '—'
                        }
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm" className="p-1">
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: 'View Details',
                            icon: EyeIcon,
                            onClick: () => onViewColumn(column)
                          },
                          {
                            label: 'Edit Column',
                            icon: PencilIcon,
                            onClick: () => onEditColumn(column)
                          },
                          {
                            label: isArchivedTab ? 'Unarchive Column' : 'Archive Column',
                            icon: isArchivedTab ? ArchiveBoxXMarkIcon : ArchiveBoxIcon,
                            onClick: () => isArchivedTab ? onUnarchiveColumn(column) : onArchiveColumn(column),
                            variant: isArchivedTab ? 'default' as const : 'danger' as const
                          }
                        ]}
                        align="right"
                      />
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={isArchivedTab ? 8 : 9} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Column Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-blue-600">
                                {column.task_count || 0}
                              </div>
                              <div className="text-xs text-gray-500">Total Tasks</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-green-600">
                                {column.completed_task_count || 0}
                              </div>
                              <div className="text-xs text-gray-500">Completed</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-orange-600">
                                {(column.task_count || 0) - (column.completed_task_count || 0)}
                              </div>
                              <div className="text-xs text-gray-500">Active Tasks</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-purple-600">
                                {column.wip_limit || '∞'}
                              </div>
                              <div className="text-xs text-gray-500">WIP Limit</div>
                            </div>
                          </div>

                          {/* Column Details */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Column Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Title:</span>
                                <div className="text-gray-900">{column.title}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Description:</span>
                                <div className="text-gray-900">
                                  {column.description || 'No description'}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Color:</span>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-4 h-4 rounded border border-gray-300"
                                    style={{ backgroundColor: column.color }}
                                  />
                                  <span className="text-gray-900 font-mono">
                                    {column.color}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <div>
                                  <Badge className={`text-xs ${
                                    column.is_archived 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {column.is_archived ? 'Archived' : 'Active'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created:</span>
                                <div>{new Date(column.created_at).toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Last Updated:</span>
                                <div>{new Date(column.updated_at).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          {/* Recent Activity */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Recent Activity
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                <span>Task "Design Homepage" completed 2 hours ago</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <ClockIcon className="h-4 w-4 text-blue-500" />
                                <span>Task "Setup Database" moved to this column 5 hours ago</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <RectangleStackIcon className="h-4 w-4 text-orange-500" />
                                <span>New task "API Development" created 1 day ago</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => onEditColumn(column)}
                              size="sm"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit Column
                            </Button>
                            <Button
                              variant={isArchivedTab ? "primary" : "danger"}
                              onClick={() => isArchivedTab ? onUnarchiveColumn(column) : onArchiveColumn(column)}
                              size="sm"
                            >
                              {isArchivedTab ? (
                                <>
                                  <ArchiveBoxXMarkIcon className="h-4 w-4 mr-2" />
                                  Unarchive
                                </>
                              ) : (
                                <>
                                  <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                                  Archive
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ColumnTable;