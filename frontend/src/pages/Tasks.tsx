import React, { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { TaskSearchFilters, TaskFilters } from '../components/Tasks/TaskSearchFilters';
import { TaskSearchResults } from '../components/Tasks/TaskSearchResults';
import { TaskSearchEngine } from '../utils/taskSearch';
import { Button } from '../components/ui/Button';
import { useToast } from '../hook';

interface Task {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'archived';
  columnId: string;
  columnName: string;
  assignee?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  autoArchiveDays?: number;
}

export const Tasks: React.FC = () => {
  const { showToast, ToastContainer } = useToast();
  
  // Mock data - will be replaced with API calls
  const [allTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design user dashboard',
      content: 'Create a comprehensive dashboard layout with charts and metrics for user analytics',
      priority: 'high',
      status: 'active',
      columnId: 'col-2',
      columnName: 'In Progress',
      assignee: '1',
      assigneeName: 'John Smith',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
      dueDate: '2024-02-15T23:59:59Z'
    },
    {
      id: '2',
      title: 'Fix authentication bug',
      content: 'Users are unable to login with their credentials. Investigation shows issue with token validation.',
      priority: 'urgent',
      status: 'active',
      columnId: 'col-1',
      columnName: 'To Do',
      assignee: '2',
      assigneeName: 'Sarah Johnson',
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-01T09:15:00Z',
      dueDate: '2024-02-03T17:00:00Z'
    },
    {
      id: '3',
      title: 'Update documentation',
      content: 'Review and update API documentation to reflect recent changes in v2.0 release',
      priority: 'medium',
      status: 'archived',
      columnId: 'col-3',
      columnName: 'Done',
      assignee: '3',
      assigneeName: 'Michael Brown',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-25T16:30:00Z',
      dueDate: '2024-01-30T23:59:59Z'
    },
    {
      id: '4',
      title: 'Implement dark mode',
      content: 'Add dark theme support across all components with proper contrast ratios',
      priority: 'low',
      status: 'active',
      columnId: 'col-1',
      columnName: 'To Do',
      createdAt: '2024-02-05T11:45:00Z',
      updatedAt: '2024-02-05T11:45:00Z'
    },
    {
      id: '5',
      title: 'Database optimization',
      content: 'Optimize slow queries and add proper indexing to improve performance',
      priority: 'high',
      status: 'archived',
      columnId: 'col-3',
      columnName: 'Done',
      assignee: '1',
      assigneeName: 'John Smith',
      createdAt: '2024-01-20T13:20:00Z',
      updatedAt: '2024-02-08T10:15:00Z'
    },
    {
      id: '6',
      title: 'Mobile responsive design',
      content: 'Ensure all pages are fully responsive on mobile devices and tablets',
      priority: 'medium',
      status: 'active',
      columnId: 'col-2',
      columnName: 'In Progress',
      assignee: '4',
      assigneeName: 'Emily Davis',
      createdAt: '2024-01-28T15:10:00Z',
      updatedAt: '2024-02-10T09:30:00Z',
      dueDate: '2024-02-20T23:59:59Z'
    }
  ]);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(allTasks);
  const [loading, setLoading] = useState(false);
  const [searchStats, setSearchStats] = useState<any>(null);

  // Load saved filters on component mount
  useEffect(() => {
    const savedFilters = TaskSearchEngine.loadSearchFilters();
    if (savedFilters) {
      handleFiltersChange(savedFilters as TaskFilters);
    }
  }, []);

  const handleFiltersChange = (filters: TaskFilters) => {
    setLoading(false);
    
    // Simulate API delay
    setTimeout(() => {
      let results = TaskSearchEngine.searchTasks(allTasks, filters);
      
      // Sort by relevance if there's a search query
      if (filters.searchQuery.trim()) {
        results = TaskSearchEngine.sortByRelevance(results, filters.searchQuery);
      }
      
      setFilteredTasks(results);
      setSearchStats(TaskSearchEngine.getSearchStats(allTasks, results));
      
      // Save filters
      TaskSearchEngine.saveSearchFilters(filters);
      
      setLoading(false);
    }, 300);
  };

  const handleClearFilters = () => {
    setFilteredTasks(allTasks);
    setSearchStats(null);
    localStorage.removeItem('taskSearchFilters');
  };

  const handleViewTask = (task: Task) => {
    console.log('View task:', task);
    // TODO: Open task detail modal
    showToast(`Viewing task: ${task.title}`, "info");
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task:', task);
    // TODO: Open task edit modal
    showToast(`Editing task: ${task.title}`, "info");
  };

  const handleArchiveTask = (task: Task) => {
    console.log('Archive task:', task);
    // TODO: Archive/unarchive task
    const action = task.status === 'active' ? 'archived' : 'unarchived';
    showToast(`Task ${action}: ${task.title}`, "success");
    
    // Mock update
    const updatedTasks = filteredTasks.map(t => 
      t.id === task.id 
        ? { ...t, status: task.status === 'active' ? 'archived' as const : 'active' as const }
        : t
    );
    setFilteredTasks(updatedTasks);
  };

  const handleExportCSV = () => {
    const csvContent = TaskSearchEngine.exportToCSV(filteredTasks);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Tasks exported to CSV successfully!", "success");
  };

  const handleShowStats = () => {
    if (searchStats) {
      const statsMessage = `
        Total Tasks: ${searchStats.total}
        Filtered Results: ${searchStats.filtered}
        Active: ${searchStats.active}
        Archived: ${searchStats.archived}
        High Priority: ${searchStats.byPriority.high + searchStats.byPriority.urgent}
      `;
      showToast(statsMessage, "info");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-6 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Search Tasks
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Find and manage all your tasks with advanced filtering
            </p>
          </div>
          
          <div className="flex space-x-3">
            {searchStats && (
              <Button
                onClick={handleShowStats}
                variant="secondary"
                className="flex items-center"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Stats
              </Button>
            )}
            
            <Button
              onClick={handleExportCSV}
              variant="secondary"
              disabled={filteredTasks.length === 0}
              className="flex items-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <div className="mb-6">
          <TaskSearchFilters
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results */}
        <TaskSearchResults
          tasks={filteredTasks}
          loading={loading}
          onViewTask={handleViewTask}
          onEditTask={handleEditTask}
          onArchiveTask={handleArchiveTask}
        />

        <ToastContainer />
      </div>
    </div>
  );
};