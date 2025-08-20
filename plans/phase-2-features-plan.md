# Phase 2 Features Plan

## Overview
This document outlines Phase 2 enhancements for the Offline Kanban Desktop App, building upon the core functionality established in Phase 1. These features focus on advanced user experience, productivity improvements, and system administration capabilities.

## Phase 2 Feature Categories

### User Management Enhancements

#### User Profile Management
- **Change Password**: Users can update their own passwords
- **Update Profile**: Edit name, username, and profile settings
- **Profile Avatar**: Upload or generate user avatars
- **User Preferences**: Personal settings and customizations

#### Advanced User Administration
- **User Deactivation/Reactivation**: Soft disable users instead of deletion
- **User Role Management**: Additional roles beyond root/normal
- **Session Management**: View active sessions, force logout
- **Password Reset**: Admin-initiated password resets

### Task Management Enhancements

#### Task Due Dates and Deadlines
- **Due Date Assignment**: Set deadlines for tasks
- **Overdue Indicators**: Visual warnings for overdue tasks
- **Due Date Notifications**: Alerts before/after due dates
- **Calendar Integration**: Calendar view of tasks by due date

#### Task Priority and Visual Enhancements
- **Priority Visualization**: Color-coded priority indicators on board
- **Priority Sorting**: Sort tasks by priority within columns
- **Task Labels/Tags**: Categorize tasks with custom labels
- **Task Time Tracking**: Optional time logging for tasks

#### Task Attachments System
- **File Attachments**: Upload documents, images, files to tasks
- **Attachment Preview**: Preview common file types
- **Attachment Management**: Download, delete, replace attachments
- **Storage Management**: File size limits and cleanup

#### Bulk Operations
- **Multi-select Tasks**: Select multiple tasks on board and list
- **Bulk Assignment**: Assign multiple tasks to users
- **Bulk Column Move**: Move multiple tasks between columns
- **Bulk Archive**: Archive multiple tasks at once
- **Bulk Priority Update**: Change priority of multiple tasks

#### Task Templates
- **Template Creation**: Root users can create task templates
- **Template Usage**: Quick task creation from templates
- **Template Variables**: Dynamic fields in templates
- **Template Management**: Edit, delete, organize templates

### Board Management Enhancements

#### Board Customization
- **Board Themes**: Color schemes and visual themes
- **Column Styling**: Custom colors and icons for columns
- **Board Layout Options**: Compact/expanded views
- **Column Width Adjustment**: Resizable columns

#### Work-in-Progress (WIP) Limits
- **Column Limits**: Set maximum task count per column
- **WIP Warnings**: Visual indicators when limits approached
- **WIP Enforcement**: Prevent moves when limits exceeded
- **WIP Analytics**: Track WIP limit effectiveness

#### Multiple Boards Support
- **Board Creation**: Create multiple project boards
- **Board Switching**: Easy navigation between boards
- **Board Templates**: Templates for common board structures
- **Cross-Board Task Movement**: Move tasks between boards

### System Administration

#### Data Management
- **Backup and Export**: Export all data (JSON, CSV formats)
- **Data Import**: Import from other tools (Trello, Jira, CSV)
- **Selective Export**: Export specific projects, date ranges
- **Automated Backups**: Scheduled backup creation

#### System Settings and Configuration
- **Global Settings Page**: System-wide configurations
- **Email Templates**: Customize notification templates
- **Auto-Archive Settings**: Global auto-archive policies
- **System Maintenance**: Database cleanup, optimization

#### Audit and Monitoring
- **Audit Logs**: Comprehensive activity tracking
- **User Activity Reports**: User engagement analytics
- **System Health**: Performance monitoring
- **Usage Statistics**: Task, user, board statistics

#### Application Lifecycle
- **Update Mechanism**: In-app update notifications
- **Version Management**: Track application versions
- **Feature Flags**: Enable/disable features dynamically
- **Migration Tools**: Database schema migration utilities

### User Experience Enhancements

#### Productivity Features
- **Global Search**: Search across all tasks, comments, users
- **Keyboard Shortcuts**: Hotkeys for common actions
- **Recent Items**: Quick access to recently viewed tasks
- **Favorites**: Star/bookmark important tasks and boards

#### Interface Improvements
- **Dark/Light Theme Toggle**: User preference themes
- **Responsive Design**: Better mobile/tablet support
- **Accessibility**: Screen reader support, keyboard navigation
- **Customizable Dashboard**: Personalized home page

#### Help and Onboarding
- **Interactive Tutorial**: Guided tour for new users
- **Help Documentation**: In-app help system
- **Tooltips and Hints**: Contextual guidance
- **Video Tutorials**: Embedded help videos

#### Advanced Filtering and Views
- **Saved Filters**: Save and reuse filter combinations
- **Custom Views**: Create personal task views
- **Advanced Date Filters**: Relative date filtering (last 7 days, etc.)
- **Boolean Filter Logic**: Complex AND/OR filter combinations

## Implementation Priority

### High Priority (Phase 2.1)
1. **User Profile Management** - Essential for user satisfaction
2. **Task Due Dates** - Critical productivity feature
3. **File Attachments** - High user demand feature
4. **Global Search** - Major usability improvement
5. **Dark/Light Theme** - Modern UX expectation

### Medium Priority (Phase 2.2)
1. **Bulk Operations** - Efficiency improvement
2. **WIP Limits** - Advanced workflow management
3. **Audit Logs** - Administrative oversight
4. **Task Templates** - Workflow standardization
5. **Backup/Export** - Data security and portability

### Lower Priority (Phase 2.3)
1. **Multiple Boards** - Advanced project management
2. **Advanced Filtering** - Power user features
3. **Integration APIs** - External tool connectivity
4. **Mobile App** - Platform expansion
5. **Advanced Analytics** - Business intelligence

## Database Schema Extensions

### New Tables for Phase 2
```sql
-- User profiles and preferences
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY,
    avatar_path TEXT,
    theme_preference TEXT DEFAULT 'system',
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Task due dates and priorities
ALTER TABLE tasks ADD COLUMN due_date DATETIME;
ALTER TABLE tasks ADD COLUMN is_overdue BOOLEAN DEFAULT 0;
ALTER TABLE tasks ADD COLUMN time_logged INTEGER DEFAULT 0; -- minutes

-- Task attachments
CREATE TABLE task_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Task templates
CREATE TABLE task_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title_template TEXT NOT NULL,
    content_template TEXT,
    default_priority TEXT DEFAULT 'medium',
    default_auto_archive_days INTEGER,
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- WIP limits
ALTER TABLE board_columns ADD COLUMN wip_limit INTEGER;
ALTER TABLE board_columns ADD COLUMN wip_enabled BOOLEAN DEFAULT 0;

-- Audit logs
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'task', 'user', 'column', 'system'
    resource_id INTEGER,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Saved filters
CREATE TABLE saved_filters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    filter_config TEXT NOT NULL, -- JSON
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## File Structure Extensions

```
offline_kanban/
├── pkg/
│   ├── services/
│   │   ├── attachment_service.go (new)
│   │   ├── template_service.go (new)
│   │   ├── backup_service.go (new)
│   │   ├── audit_service.go (new)
│   │   └── search_service.go (new)
│   ├── handlers/
│   │   ├── file_handler.go (new)
│   │   └── backup_handler.go (new)
│   └── utils/
│       ├── file_utils.go (new)
│       └── search_utils.go (new)
├── frontend/src/
│   ├── components/
│   │   ├── Attachments/ (new)
│   │   ├── Templates/ (new)
│   │   ├── UserProfile/ (new)
│   │   ├── GlobalSearch/ (new)
│   │   ├── BulkOperations/ (new)
│   │   ├── Settings/ (new)
│   │   └── Help/ (new)
│   ├── hooks/
│   │   ├── useAttachments.tsx (new)
│   │   ├── useTemplates.tsx (new)
│   │   ├── useGlobalSearch.tsx (new)
│   │   └── useTheme.tsx (new)
│   ├── pages/
│   │   ├── UserProfile.tsx (new)
│   │   ├── Settings.tsx (new)
│   │   ├── AuditLogs.tsx (new)
│   │   └── Help.tsx (new)
│   └── utils/
│       ├── fileUtils.ts (new)
│       ├── searchUtils.ts (new)
│       └── themeUtils.ts (new)
├── storage/ (new)
│   ├── attachments/
│   ├── avatars/
│   └── backups/
└── docs/ (new)
    ├── user-guide.md
    ├── admin-guide.md
    └── api-reference.md
```

## Success Criteria for Phase 2

### User Management
- [ ] Users can update their profiles and passwords
- [ ] Admins can deactivate/reactivate users
- [ ] Session management works properly
- [ ] User avatars display correctly

### Task Features
- [ ] Due dates show on tasks with overdue indicators
- [ ] File attachments upload and preview correctly
- [ ] Bulk operations work across multiple tasks
- [ ] Task templates create consistent tasks
- [ ] Priority visualization is clear and useful

### Board Features
- [ ] WIP limits prevent over-allocation
- [ ] Board themes change appearance
- [ ] Column customization saves properly
- [ ] Multiple boards can be created and managed

### System Features
- [ ] Global search finds relevant results quickly
- [ ] Backup/export produces complete data files
- [ ] Import successfully recreates data
- [ ] Audit logs track all significant actions
- [ ] System settings persist correctly

### User Experience
- [ ] Dark/light theme toggle works seamlessly
- [ ] Keyboard shortcuts improve productivity
- [ ] Help system provides useful guidance
- [ ] Performance remains good with Phase 2 features

## Timeline Estimation

### Phase 2.1 (High Priority): 35-45 days
- User Profile Management: 8-10 days
- Task Due Dates: 6-8 days
- File Attachments: 10-12 days
- Global Search: 6-8 days
- Dark/Light Theme: 5-7 days

### Phase 2.2 (Medium Priority): 40-50 days
- Bulk Operations: 8-10 days
- WIP Limits: 6-8 days
- Audit Logs: 8-10 days
- Task Templates: 10-12 days
- Backup/Export: 8-10 days

### Phase 2.3 (Lower Priority): 30-40 days
- Multiple Boards: 12-15 days
- Advanced Filtering: 8-10 days
- Help System: 5-7 days
- Performance Optimization: 5-8 days

**Total Phase 2 Estimated Time**: 105-135 days

## Notes

- Phase 2 features build incrementally on Phase 1 foundation
- Each sub-phase can be released independently
- Prioritization can be adjusted based on user feedback
- Database migrations ensure smooth upgrades
- Backward compatibility maintained throughout
- Performance impact considered for all features
- Security implications reviewed for file uploads and user management
- Mobile responsiveness maintained for all new features