import React, { useState, useEffect } from 'react';
import { Kanban } from 'react-kanban-kit';
import { useTheme } from '../contexts/ThemeContext';
import { TaskDetailsModal } from './Tasks/TaskDetailsModal';
import { getTasks, moveTask, TaskResponse } from '../api/taskService';
import { getColumns, Column } from '../api/columnService';

interface KanbanNode {
  id: string;
  title: string;
  children: string[];
  totalChildrenCount: number;
  parentId: string | null;
  type?: 'card';
  content?: {
    description?: string;
    priority?: string;
    assignee?: string;
    dueDate?: string;
  };
}

interface KanbanDataSource {
  [key: string]: KanbanNode;
}

interface KanbanBoardProps {
  onTaskCreated?: () => void;
}

export const KanbanBoard = React.forwardRef<{ refresh: () => void }, KanbanBoardProps>(({ onTaskCreated }, ref) => {
  const { isDarkMode } = useTheme();
  const [selectedTask, setSelectedTask] = useState<KanbanNode | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dataSource, setDataSource] = useState<KanbanDataSource>({});

  // Fetch data from backend
  const fetchKanbanData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [columnsResponse, tasksResponse] = await Promise.all([
          getColumns(),
          getTasks({ order_by: 'position', order_dir: 'asc' })
        ]);

        const columns = columnsResponse.columns;
        const tasks = tasksResponse.tasks;

        // Build kanban data structure
        const newDataSource: KanbanDataSource = {
          root: {
            id: "root",
            title: "Root",
            children: columns.map(col => `col-${col.id}`),
            totalChildrenCount: columns.length,
            parentId: null,
          }
        };

        // Add columns
        columns.forEach(column => {
          const columnTasks = tasks
            .filter(task => task.column_id === column.id)
            .sort((a, b) => a.position - b.position);

          newDataSource[`col-${column.id}`] = {
            id: `col-${column.id}`,
            title: column.title,
            children: columnTasks.map(task => `task-${task.id}`),
            totalChildrenCount: columnTasks.length,
            parentId: "root",
          };
        });

        // Add tasks
        tasks.forEach(task => {
          newDataSource[`task-${task.id}`] = {
            id: `task-${task.id}`,
            title: task.title,
            parentId: `col-${task.column_id}`,
            children: [],
            totalChildrenCount: 0,
            type: "card",
            content: {
              description: task.description || '',
              priority: task.priority || '',
              assignee: task.assigned_user?.name || task.assigned_user?.user_name || '',
              dueDate: task.due_date || '',
            },
          };
        });

        setDataSource(newDataSource);
      } catch (err) {
        console.error('Error fetching kanban data:', err);
        setError('Failed to load kanban data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  // Expose refresh method via ref
  React.useImperativeHandle(ref, () => ({
    refresh: fetchKanbanData
  }));

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const configMap = {
    card: {
      render: ({ data, column, index, isDraggable }: any) => (
        <div className="kanban-card p-4 rounded-lg shadow-sm border transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
          <h3 className="font-semibold mb-2">{data.title}</h3>
          {data.content?.description && (
            <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
              {data.content.description}
            </p>
          )}
          <div className="card-meta">
            {data.content?.priority && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                data.content.priority === 'high' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : data.content.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {data.content.priority}
              </span>
            )}
          </div>
        </div>
      ),
      isDraggable: true,
    },
  };

  const kanbanStyles = {
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const columnStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  // Show loading state
  if (loading) {
    return (
      <div style={kanbanStyles} className='pt-6 flex justify-center items-center h-64'>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading kanban board...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={kanbanStyles} className='pt-6 flex justify-center items-center h-64'>
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-2">⚠️ Error</div>
          <div className="text-gray-600 dark:text-gray-300">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={kanbanStyles} className='pt-6'>
      <Kanban
        dataSource={dataSource}
        configMap={configMap}
        columnWrapperStyle={() => columnStyle}
        onCardClick={(_, card) => {
          setSelectedTask(card);
          setIsTaskDetailsOpen(true);
        }}
        onCardMove={async (move) => {
          try {
            // Extract task ID and column ID from the move data
            const taskId = parseInt(move.cardId.replace('task-', ''));
            const newColumnId = parseInt(move.toColumnId.replace('col-', ''));
            
            // Calculate new position based on target index
            const targetColumn = dataSource[move.toColumnId];
            const newPosition = move.targetIndex || targetColumn.children.length;

            // Call backend API to move the task
            await moveTask(taskId, {
              column_id: newColumnId,
              new_position: newPosition
            });

            // Update local state optimistically
            if (Object.hasOwn(dataSource, move.toColumnId)) {
              const source = {...dataSource};

              const targetColumn = source[move.toColumnId];
              if (!targetColumn.children.find((id: string) => id === move.cardId)) {
                targetColumn.children.push(move.cardId);
                targetColumn.totalChildrenCount = targetColumn.children.length;
              }

              const sourceColumn = source[move.fromColumnId];
              sourceColumn.children = sourceColumn.children.filter(
                (id: string) => id !== move.cardId
              );
              sourceColumn.totalChildrenCount = sourceColumn.children.length;

              // Update the task's parentId
              const task = source[move.cardId];
              if (task) {
                task.parentId = move.toColumnId;
              }

              setDataSource({...source});
            }
          } catch (error) {
            console.error('Error moving task:', error);
            // Optionally show error message to user
            // You could add a toast notification here
          }
        }}
        onColumnMove={(move) => {
          console.log("Column moved:", move);
          // Handle column reordering
        }}
      />
      
      <TaskDetailsModal
        isOpen={isTaskDetailsOpen}
        onClose={() => {
          setIsTaskDetailsOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
});