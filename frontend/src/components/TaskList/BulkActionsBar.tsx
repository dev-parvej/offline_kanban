import React from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  ArrowRightIcon,
  ArchiveBoxIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useUsers } from '../../hooks/useUsers';
import { useColumns } from '../../hooks/useColumns';

interface BulkActionsBarProps {
  selectedCount: number;
  onAssign: (assigneeId: number | null) => void;
  onMove: (columnId: number) => void;
  onArchive: () => void;
  onClear: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onAssign,
  onMove,
  onArchive,
  onClear
}) => {
  const { users } = useUsers();
  const { columns } = useColumns();

  // Assignee options
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map(user => ({
      value: user.id.toString(),
      label: user.name
    }))
  ];

  // Column options (only active columns)
  const columnOptions = columns
    .filter(col => !col.is_archived)
    .map(column => ({
      value: column.id.toString(),
      label: column.title
    }));

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Selected Count */}
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5 text-blue-600" />
            <Badge variant="primary" className="text-sm">
              {selectedCount} selected
            </Badge>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-3">
            {/* Assign Tasks */}
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Assign to:</span>
              <Select
                placeholder="Select assignee"
                options={assigneeOptions}
                onChange={(value) => onAssign(value ? Number(value) : null)}
                className="min-w-[140px]"
              />
            </div>

            {/* Move Tasks */}
            <div className="flex items-center space-x-2">
              <ArrowRightIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Move to:</span>
              <Select
                placeholder="Select column"
                options={columnOptions}
                onChange={(value) => onMove(Number(value))}
                className="min-w-[140px]"
              />
            </div>

            {/* Archive Tasks */}
            <Button
              variant="outline"
              onClick={onArchive}
              className="text-sm border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArchiveBoxIcon className="h-4 w-4 mr-1" />
              Archive
            </Button>
          </div>
        </div>

        {/* Clear Selection */}
        <Button
          variant="ghost"
          onClick={onClear}
          className="text-gray-600 hover:text-gray-800"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          Clear Selection
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;