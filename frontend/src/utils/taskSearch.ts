import { TaskFilters } from '../components/Tasks/TaskSearchFilters';

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

export class TaskSearchEngine {
  /**
   * Search and filter tasks based on provided filters
   */
  static searchTasks(tasks: Task[], filters: TaskFilters): Task[] {
    let filteredTasks = [...tasks];

    // Text search in title and content
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filteredTasks = filteredTasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const contentMatch = task.content.toLowerCase().includes(query);
        return titleMatch || contentMatch;
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Column filter
    if (filters.column !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.columnId === filters.column);
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned') {
        filteredTasks = filteredTasks.filter(task => !task.assignee);
      } else {
        filteredTasks = filteredTasks.filter(task => task.assignee === filters.assignee);
      }
    }

    // Due date range filter
    if (filters.dateFrom || filters.dateTo) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        
        const taskDueDate = new Date(task.dueDate);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
        
        if (fromDate && taskDueDate < fromDate) return false;
        if (toDate && taskDueDate > toDate) return false;
        
        return true;
      });
    }

    // Created date range filter
    if (filters.createdDateFrom || filters.createdDateTo) {
      filteredTasks = filteredTasks.filter(task => {
        const taskCreatedDate = new Date(task.createdAt);
        const fromDate = filters.createdDateFrom ? new Date(filters.createdDateFrom) : null;
        const toDate = filters.createdDateTo ? new Date(filters.createdDateTo) : null;
        
        if (fromDate && taskCreatedDate < fromDate) return false;
        if (toDate && taskCreatedDate > toDate) return false;
        
        return true;
      });
    }

    return filteredTasks;
  }

  /**
   * Highlight search terms in text
   */
  static highlightSearchTerms(text: string, searchQuery: string): string {
    if (!searchQuery.trim()) return text;
    
    const query = searchQuery.trim();
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
  }

  /**
   * Get search suggestions based on existing tasks
   */
  static getSearchSuggestions(tasks: Task[], query: string): string[] {
    if (!query.trim() || query.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    tasks.forEach(task => {
      // Get title words
      const titleWords = task.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.includes(lowerQuery) && word.length > 2) {
          suggestions.add(word);
        }
      });

      // Get content words
      const contentWords = task.content.toLowerCase().split(/\s+/);
      contentWords.forEach(word => {
        if (word.includes(lowerQuery) && word.length > 2) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Sort tasks by relevance score
   */
  static sortByRelevance(tasks: Task[], searchQuery: string): Task[] {
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();
    
    return tasks.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate relevance score for a task
   */
  private static calculateRelevanceScore(task: Task, query: string): number {
    let score = 0;
    const lowerTitle = task.title.toLowerCase();
    const lowerContent = task.content.toLowerCase();

    // Title matches get higher score
    if (lowerTitle.includes(query)) {
      score += 10;
      // Exact title match gets even higher score
      if (lowerTitle === query) {
        score += 20;
      }
      // Title starts with query gets bonus
      if (lowerTitle.startsWith(query)) {
        score += 5;
      }
    }

    // Content matches
    if (lowerContent.includes(query)) {
      score += 5;
      // Multiple occurrences in content
      const matches = (lowerContent.match(new RegExp(query, 'g')) || []).length;
      score += matches;
    }

    // Boost score for active tasks
    if (task.status === 'active') {
      score += 2;
    }

    // Boost score for high priority tasks
    if (task.priority === 'urgent') {
      score += 3;
    } else if (task.priority === 'high') {
      score += 2;
    } else if (task.priority === 'medium') {
      score += 1;
    }

    // Recent tasks get slight boost
    const daysSinceUpdate = (Date.now() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      score += 1;
    }

    return score;
  }

  /**
   * Get search statistics
   */
  static getSearchStats(tasks: Task[], filteredTasks: Task[]): {
    total: number;
    filtered: number;
    active: number;
    archived: number;
    byPriority: Record<string, number>;
    byColumn: Record<string, number>;
  } {
    const stats = {
      total: tasks.length,
      filtered: filteredTasks.length,
      active: 0,
      archived: 0,
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      byColumn: {} as Record<string, number>
    };

    filteredTasks.forEach(task => {
      // Status counts
      if (task.status === 'active') {
        stats.active++;
      } else {
        stats.archived++;
      }

      // Priority counts
      stats.byPriority[task.priority]++;

      // Column counts
      if (!stats.byColumn[task.columnName]) {
        stats.byColumn[task.columnName] = 0;
      }
      stats.byColumn[task.columnName]++;
    });

    return stats;
  }

  /**
   * Export filtered tasks to CSV
   */
  static exportToCSV(tasks: Task[]): string {
    const headers = [
      'ID',
      'Title', 
      'Content',
      'Priority',
      'Status',
      'Column',
      'Assignee',
      'Created Date',
      'Updated Date',
      'Due Date'
    ];

    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.content.replace(/"/g, '""')}"`,
        task.priority,
        task.status,
        task.columnName,
        task.assigneeName || 'Unassigned',
        task.createdAt,
        task.updatedAt,
        task.dueDate || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Save search filters to localStorage
   */
  static saveSearchFilters(filters: TaskFilters): void {
    try {
      localStorage.setItem('taskSearchFilters', JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save search filters:', error);
    }
  }

  /**
   * Load search filters from localStorage
   */
  static loadSearchFilters(): Partial<TaskFilters> | null {
    try {
      const saved = localStorage.getItem('taskSearchFilters');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load search filters:', error);
      return null;
    }
  }
}