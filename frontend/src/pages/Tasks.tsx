import React, { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { TaskSearchFilters, TaskFilters } from '../components/Tasks/TaskSearchFilters';
import { TaskSearchResults } from '../components/Tasks/TaskSearchResults';
import { TaskSearchEngine } from '../utils/taskSearch';
import { Button } from '../components/ui/Button';
import { useToast } from '../hook';
import { getTasks, TaskResponse, TaskFilters as BackendTaskFilters } from '../api/taskService';

// Use the TaskResponse interface from the API service, with legacy compatibility
interface Task {
  id: number;
  title: string;
  content: string;
  priority?: string;
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
  
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchStats, setSearchStats] = useState<any>(null);

  // Fetch all tasks from backend
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setInitialLoading(true);
        const response = await getTasks({ 
          page_size: 100,  // Get a large number of tasks for search
          order_by: 'updated_at',
          order_dir: 'desc'
        });
        
        // Transform backend data to match UI expectations
        const transformedTasks: Task[] = response.tasks.map(task => ({
          ...task,
          // Legacy compatibility fields
          content: task.description || '',
          status: 'active' as const, // Assume all tasks are active for now
          columnId: task.column_id?.toString() || '', // Ensure columnId is present and a string
          columnName: task.column_title || '',
          assignee: task.assigned_to?.toString(),
          assigneeName: task.assigned_user?.name || task.assigned_user?.user_name || '',
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          dueDate: task.due_date || '',
        }));
        
        setAllTasks(transformedTasks);
        setFilteredTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        showToast('Failed to load tasks. Please try again.', 'error');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  // Load saved filters on component mount
  useEffect(() => {
    if (allTasks.length > 0) {
      const savedFilters = TaskSearchEngine.loadSearchFilters();
      if (savedFilters) {
        handleFiltersChange(savedFilters as TaskFilters);
      }
    }
  }, [allTasks]);

  const handleFiltersChange = (filters: TaskFilters) => {
    setLoading(true);
    
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
    // TODO: Archive/unarchive task via API
    const action = task.status === 'active' ? 'archived' : 'unarchived';
    showToast(`Task ${action}: ${task.title}`, "success");
    
    // Mock update for now
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading tasks...</span>
      </div>
    );
  }

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