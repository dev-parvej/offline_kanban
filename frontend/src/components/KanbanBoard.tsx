import React, { useState } from 'react';
import { Kanban } from 'react-kanban-kit';
import { useTheme } from '../contexts/ThemeContext';

export const KanbanBoard: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const [dataSource, setDataSource] = useState({
    root: {
      id: "root",
      title: "Root",
      children: ["col-1", "col-2", "col-3"],
      totalChildrenCount: 3,
      parentId: null,
    },
    "col-1": {
      id: "col-1",
      title: "To Do",
      children: ["task-1", "task-2"],
      totalChildrenCount: 2,
      parentId: "root",
    },
    "col-2": {
      id: "col-2",
      title: "In Progress",
      children: ["task-3"],
      totalChildrenCount: 1,
      parentId: "root",
    },
    "col-3": {
      id: "col-3",
      title: "Done",
      children: ["task-4"],
      totalChildrenCount: 1,
      parentId: "root",
    },
    "task-1": {
      id: "task-1",
      title: "Design Homepage",
      parentId: "col-1",
      children: [],
      totalChildrenCount: 0,
      type: "card",
      content: {
        description: "Create wireframes and mockups for the homepage",
        priority: "high",
      },
    },
    "task-2": {
      id: "task-2",
      title: "Setup Database",
      parentId: "col-1",
      children: [],
      totalChildrenCount: 0,
      type: "card",
    },
    "task-3": {
      id: "task-3",
      title: "Develop API",
      parentId: "col-2",
      children: [],
      totalChildrenCount: 0,
      type: "card",
    },
    "task-4": {
      id: "task-4",
      title: "Deploy App",
      parentId: "col-3",
      children: [],
      totalChildrenCount: 0,
      type: "card",
    },
  });

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

  return (
    <div style={kanbanStyles} className='pt-6'>
      <Kanban
        dataSource={dataSource}
        configMap={configMap}
        columnWrapperStyle={() => columnStyle}
        onCardClick={(_, card) => {
          // Handle card click
        }}
        onCardMove={(move) => {
          if (Object.hasOwn(dataSource, move.toColumnId)) {
            const source = {...dataSource}

            const targetColumn = (source as any)[move.toColumnId];
            if (!targetColumn.children.find((id: string) => id === move.cardId)) {
              targetColumn.children.push(move.cardId);
              targetColumn.totalChildrenCount = targetColumn.children.length;
            }

            const sourceColumn = (source as any)[move.fromColumnId];
            sourceColumn.children = sourceColumn.children.filter(
              (id: string) => id !== move.cardId
            );
            sourceColumn.totalChildrenCount = sourceColumn.children.length;
            setDataSource({...source});
          }
        }}
        onColumnMove={(move) => {
          console.log("Column moved:", move);
          // Handle column reordering
        }}
      />
    </div>
  );
};