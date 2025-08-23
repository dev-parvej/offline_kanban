# In-App Notification System Plan

## Overview
This document outlines the plan for implementing an in-app notification system for the Offline Kanban Desktop App. The system provides real-time notifications within the application only (no SMS/email), with different notification rules for root and normal users.

## Notification Distribution Rules

### Root User Notifications
- **Receives ALL notifications** in the system
- Gets notified about any activity across all tasks, users, and system events
- Can see system-wide activity feed
- Administrative notifications (user creation, system events)

### Normal User Notifications
- **Task Assignment**: When assigned to a task
- **Task Mentions**: When mentioned in task title, content, or comments (using @username)
- **Task Comments**: When someone comments on tasks they created or are assigned to
- **Task Updates**: When tasks they're involved with are modified (title, content, status, column)
- **Task Completion**: When tasks they created are marked complete
- **Task Archive**: When tasks they created or are assigned to are archived

## Notification Types and Triggers

### Task-Related Notifications
```typescript
enum NotificationType {
  // Assignment notifications
  TASK_ASSIGNED = 'task_assigned',
  TASK_UNASSIGNED = 'task_unassigned',
  
  // Comment notifications
  TASK_COMMENTED = 'task_commented',
  COMMENT_REPLIED = 'comment_replied',
  
  // Mention notifications
  MENTIONED_IN_TASK = 'mentioned_in_task',
  MENTIONED_IN_COMMENT = 'mentioned_in_comment',
  
  // Task update notifications
  TASK_UPDATED = 'task_updated',
  TASK_MOVED = 'task_moved',
  TASK_COMPLETED = 'task_completed',
  TASK_ARCHIVED = 'task_archived',
  
  // System notifications (root only)
  USER_CREATED = 'user_created',
  COLUMN_CREATED = 'column_created',
  COLUMN_ARCHIVED = 'column_archived',
  SYSTEM_EVENT = 'system_event'
}
```

## Database Schema Design

### Notifications Table (NOT IMPLEMENTED)
**STATUS: TO BE CREATED**

**Current Database Status**: ❌ Notifications system not implemented

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,           -- User who receives the notification
    sender_id INTEGER,                       -- User who triggered the notification (NULL for system)
    type TEXT NOT NULL,                      -- Notification type enum
    title TEXT NOT NULL,                     -- Notification title/subject
    message TEXT NOT NULL,                   -- Notification message/body
    
    -- Related entities
    task_id INTEGER,                         -- Related task (if applicable)
    comment_id INTEGER,                      -- Related comment (if applicable)
    
    -- Metadata
    data TEXT,                              -- JSON data for additional context
    is_read BOOLEAN NOT NULL DEFAULT 0,     -- Read status
    is_system BOOLEAN NOT NULL DEFAULT 0,   -- System notification flag
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,                       -- When notification was read
    
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,  -- Note: comments table exists
    
    CHECK (type IN (
        'task_assigned', 'task_unassigned', 'task_commented', 'comment_replied',
        'mentioned_in_task', 'mentioned_in_comment', 'task_updated', 'task_moved',
        'task_completed', 'task_archived', 'user_created', 'column_created',
        'column_archived', 'system_event'
    ))
);
```

### Notification Preferences Table (FUTURE ENHANCEMENT)
**STATUS: TO BE CREATED LATER**

```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notification_type TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, notification_type)
);
```

## Implementation Status & Plan

**Current Status**: ❌ No notification system implemented
- No database tables
- No backend APIs
- No frontend components
- No notification logic

**Dependencies**: 
- ✅ Users table exists
- ✅ Tasks table exists  
- ✅ Comments table exists
- ❌ Task history tracking missing

### Phase 1: Notification Database Layer

1. **Notification Database Operations**
   ```go
   // pkg/database/notifications.go
   type Notification struct {
       ID          int       `json:"id"`
       RecipientID int       `json:"recipient_id"`
       SenderID    *int      `json:"sender_id"`
       Type        string    `json:"type"`
       Title       string    `json:"title"`
       Message     string    `json:"message"`
       TaskID      *int      `json:"task_id"`
       CommentID   *int      `json:"comment_id"`
       Data        *string   `json:"data"`        // JSON string
       IsRead      bool      `json:"is_read"`
       IsSystem    bool      `json:"is_system"`
       CreatedAt   time.Time `json:"created_at"`
       ReadAt      *time.Time `json:"read_at"`
       
       // Loaded relationships
       Sender      *User     `json:"sender,omitempty"`
       Task        *Task     `json:"task,omitempty"`
       Comment     *Comment  `json:"comment,omitempty"`
   }

   func (d *Database) CreateNotification(notification *Notification) error
   func (d *Database) GetUserNotifications(userId int, limit, offset int) ([]*Notification, error)
   func (d *Database) GetUnreadNotifications(userId int) ([]*Notification, error)
   func (d *Database) MarkNotificationRead(notificationId int, userId int) error
   func (d *Database) MarkAllNotificationsRead(userId int) error
   func (d *Database) GetNotificationCount(userId int, unreadOnly bool) (int, error)
   func (d *Database) DeleteNotification(notificationId int, userId int) error
   func (d *Database) CleanOldNotifications(olderThan time.Time) error
   ```

2. **Notification Creation Helpers**
   ```go
   // pkg/services/notification_service.go
   type NotificationService struct {
       db *database.Database
   }

   func (ns *NotificationService) NotifyTaskAssigned(taskId int, assigneeId int, assignedBy int) error
   func (ns *NotificationService) NotifyTaskComment(taskId int, commentId int, commentBy int) error
   func (ns *NotificationService) NotifyMentionsInText(text string, contextType string, contextId int, mentionedBy int) error
   func (ns *NotificationService) NotifyTaskUpdated(taskId int, updatedBy int, changes map[string]interface{}) error
   func (ns *NotificationService) NotifySystemEvent(eventType string, message string) error

   // Helper functions
   func (ns *NotificationService) extractMentions(text string) []string
   func (ns *NotificationService) getTaskParticipants(taskId int) ([]int, error)
   func (ns *NotificationService) shouldNotifyUser(userId int, notificationType string) bool
   func (ns *NotificationService) getAllRootUsers() ([]int, error)
   ```

### Phase 2: Notification Targeting Logic

1. **Notification Rules Engine**
   ```go
   // pkg/services/notification_rules.go
   type NotificationRules struct {
       db *database.Database
   }

   func (nr *NotificationRules) GetRecipientsForTaskAssignment(taskId int, assigneeId int) []int {
       recipients := []int{}
       
       // Always notify the assignee
       recipients = append(recipients, assigneeId)
       
       // Notify all root users
       rootUsers := nr.getAllRootUsers()
       recipients = append(recipients, rootUsers...)
       
       return nr.deduplicateRecipients(recipients)
   }

   func (nr *NotificationRules) GetRecipientsForTaskComment(taskId int, commentBy int) []int {
       recipients := []int{}
       
       task := nr.getTask(taskId)
       
       // Notify task creator (if not the commenter)
       if task.CreatedBy != commentBy {
           recipients = append(recipients, task.CreatedBy)
       }
       
       // Notify assignee (if exists and not the commenter)
       if task.AssignedTo != nil && *task.AssignedTo != commentBy {
           recipients = append(recipients, *task.AssignedTo)
       }
       
       // Notify all root users (except the commenter)
       rootUsers := nr.getAllRootUsers()
       for _, rootId := range rootUsers {
           if rootId != commentBy {
               recipients = append(recipients, rootId)
           }
       }
       
       return nr.deduplicateRecipients(recipients)
   }

   func (nr *NotificationRules) GetRecipientsForMention(mentionedUsernames []string, contextBy int) []int {
       recipients := []int{}
       
       // Add mentioned users
       for _, username := range mentionedUsernames {
           userId := nr.getUserIdByUsername(username)
           if userId > 0 && userId != contextBy {
               recipients = append(recipients, userId)
           }
       }
       
       // Always notify root users about mentions
       rootUsers := nr.getAllRootUsers()
       recipients = append(recipients, rootUsers...)
       
       return nr.deduplicateRecipients(recipients)
   }
   ```

2. **Mention Detection System**
   ```go
   // pkg/services/mention_parser.go
   import "regexp"

   type MentionParser struct {
       mentionRegex *regexp.Regexp
   }

   func NewMentionParser() *MentionParser {
       return &MentionParser{
           mentionRegex: regexp.MustCompile(`@([a-zA-Z0-9._-]+)`),
       }
   }

   func (mp *MentionParser) ExtractMentions(text string) []string {
       matches := mp.mentionRegex.FindAllStringSubmatch(text, -1)
       var mentions []string
       for _, match := range matches {
           if len(match) > 1 {
               mentions = append(mentions, match[1])
           }
       }
       return mp.deduplicateMentions(mentions)
   }

   func (mp *MentionParser) ReplaceMentionsWithLinks(text string) string {
       return mp.mentionRegex.ReplaceAllStringFunc(text, func(match string) string {
           username := match[1:] // Remove @ symbol
           return fmt.Sprintf(`<span class="mention" data-username="%s">@%s</span>`, username, username)
       })
   }
   ```

### Phase 3: Backend API Integration

1. **Notification API Methods**
   ```go
   // app.go - Notification related methods
   func (a *App) GetNotifications(limit, offset int) ([]*Notification, error) {
       userId := a.getCurrentUserId()
       return a.db.GetUserNotifications(userId, limit, offset)
   }

   func (a *App) GetUnreadNotifications() ([]*Notification, error) {
       userId := a.getCurrentUserId()
       return a.db.GetUnreadNotifications(userId)
   }

   func (a *App) MarkNotificationRead(notificationId int) error {
       userId := a.getCurrentUserId()
       return a.db.MarkNotificationRead(notificationId, userId)
   }

   func (a *App) MarkAllNotificationsRead() error {
       userId := a.getCurrentUserId()
       return a.db.MarkAllNotificationsRead(userId)
   }

   func (a *App) GetNotificationCount(unreadOnly bool) (int, error) {
       userId := a.getCurrentUserId()
       return a.db.GetNotificationCount(userId, unreadOnly)
   }

   func (a *App) DeleteNotification(notificationId int) error {
       userId := a.getCurrentUserId()
       return a.db.DeleteNotification(notificationId, userId)
   }
   ```

2. **Integration with Existing Operations**
   ```go
   // Update existing methods to trigger notifications
   func (a *App) AssignTask(taskId int, assigneeId *int) error {
       // ... existing assignment logic ...
       
       // Trigger notification
       if assigneeId != nil {
           a.notificationService.NotifyTaskAssigned(taskId, *assigneeId, a.getCurrentUserId())
       }
       
       return nil
   }

   func (a *App) AddTaskComment(taskId int, comment string) error {
       // ... existing comment logic ...
       
       // Check for mentions
       mentions := a.mentionParser.ExtractMentions(comment)
       if len(mentions) > 0 {
           a.notificationService.NotifyMentionsInText(comment, "comment", commentId, a.getCurrentUserId())
       }
       
       // Notify task participants
       a.notificationService.NotifyTaskComment(taskId, commentId, a.getCurrentUserId())
       
       return nil
   }
   ```

### Phase 4: Frontend Notification Components

1. **Notification Center**
   ```typescript
   // frontend/src/components/Notifications/NotificationCenter.tsx
   const NotificationCenter: React.FC = () => {
     const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
     const [isOpen, setIsOpen] = useState(false);

     return (
       <div className="notification-center">
         <button 
           className="notification-bell"
           onClick={() => setIsOpen(!isOpen)}
         >
           <BellIcon />
           {unreadCount > 0 && (
             <span className="notification-badge">{unreadCount}</span>
           )}
         </button>

         {isOpen && (
           <div className="notification-dropdown">
             <div className="notification-header">
               <h3>Notifications</h3>
               <button onClick={markAllAsRead}>Mark all read</button>
             </div>
             
             <div className="notification-list">
               {notifications.length === 0 ? (
                 <div className="no-notifications">No notifications</div>
               ) : (
                 notifications.map(notification => (
                   <NotificationItem
                     key={notification.id}
                     notification={notification}
                     onMarkRead={markAsRead}
                     onDelete={deleteNotification}
                   />
                 ))
               )}
             </div>
           </div>
         )}
       </div>
     );
   };
   ```

2. **Notification Item Component**
   ```typescript
   // frontend/src/components/Notifications/NotificationItem.tsx
   interface NotificationItemProps {
     notification: Notification;
     onMarkRead: (id: number) => void;
     onDelete: (id: number) => void;
   }

   const NotificationItem: React.FC<NotificationItemProps> = ({
     notification,
     onMarkRead,
     onDelete
   }) => {
     const handleClick = () => {
       if (!notification.is_read) {
         onMarkRead(notification.id);
       }
       
       // Navigate to related task/comment if applicable
       if (notification.task_id) {
         navigateToTask(notification.task_id);
       }
     };

     return (
       <div 
         className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
         onClick={handleClick}
       >
         <div className="notification-icon">
           <NotificationTypeIcon type={notification.type} />
         </div>
         
         <div className="notification-content">
           <div className="notification-title">{notification.title}</div>
           <div className="notification-message">{notification.message}</div>
           <div className="notification-time">
             {formatTimeAgo(notification.created_at)}
           </div>
         </div>
         
         <div className="notification-actions">
           {!notification.is_read && (
             <button onClick={(e) => {
               e.stopPropagation();
               onMarkRead(notification.id);
             }}>
               Mark read
             </button>
           )}
           <button onClick={(e) => {
             e.stopPropagation();
             onDelete(notification.id);
           }}>
             Delete
           </button>
         </div>
       </div>
     );
   };
   ```

3. **Notification Hooks**
   ```typescript
   // frontend/src/hooks/useNotifications.tsx
   const useNotifications = () => {
     const [notifications, setNotifications] = useState<Notification[]>([]);
     const [unreadCount, setUnreadCount] = useState(0);
     const [loading, setLoading] = useState(false);

     const loadNotifications = useCallback(async () => {
       setLoading(true);
       try {
         const [notificationList, count] = await Promise.all([
           notificationService.getNotifications(50, 0),
           notificationService.getNotificationCount(true) // unread only
         ]);
         
         setNotifications(notificationList);
         setUnreadCount(count);
       } catch (error) {
         console.error('Failed to load notifications:', error);
       } finally {
         setLoading(false);
       }
     }, []);

     const markAsRead = async (notificationId: number) => {
       await notificationService.markAsRead(notificationId);
       setNotifications(prev => prev.map(n => 
         n.id === notificationId ? { ...n, is_read: true, read_at: new Date() } : n
       ));
       setUnreadCount(prev => Math.max(0, prev - 1));
     };

     const markAllAsRead = async () => {
       await notificationService.markAllAsRead();
       setNotifications(prev => prev.map(n => ({ 
         ...n, 
         is_read: true, 
         read_at: n.read_at || new Date() 
       })));
       setUnreadCount(0);
     };

     const deleteNotification = async (notificationId: number) => {
       await notificationService.deleteNotification(notificationId);
       setNotifications(prev => prev.filter(n => n.id !== notificationId));
       // Update unread count if deleted notification was unread
       const deletedNotification = notifications.find(n => n.id === notificationId);
       if (deletedNotification && !deletedNotification.is_read) {
         setUnreadCount(prev => Math.max(0, prev - 1));
       }
     };

     // Poll for new notifications every 30 seconds
     useEffect(() => {
       loadNotifications();
       const interval = setInterval(loadNotifications, 30000);
       return () => clearInterval(interval);
     }, [loadNotifications]);

     return {
       notifications,
       unreadCount,
       loading,
       markAsRead,
       markAllAsRead,
       deleteNotification,
       refresh: loadNotifications
     };
   };
   ```

### Phase 5: Real-time Updates (Future Enhancement)

1. **WebSocket Integration**
   ```go
   // pkg/websocket/notification_hub.go
   type NotificationHub struct {
       clients    map[int]*websocket.Conn  // userId -> connection
       broadcast  chan *Notification
       register   chan *Client
       unregister chan *Client
   }

   func (h *NotificationHub) SendToUser(userId int, notification *Notification) {
       if conn, exists := h.clients[userId]; exists {
           conn.WriteJSON(notification)
       }
   }

   func (h *NotificationHub) SendToRootUsers(notification *Notification) {
       rootUsers := h.getRootUserIds()
       for _, userId := range rootUsers {
           h.SendToUser(userId, notification)
       }
   }
   ```

### Phase 6: Notification Templates

1. **Template System**
   ```go
   // pkg/services/notification_templates.go
   type NotificationTemplate struct {
       Type    string
       Title   func(data map[string]interface{}) string
       Message func(data map[string]interface{}) string
   }

   var NotificationTemplates = map[string]NotificationTemplate{
       "task_assigned": {
           Type: "task_assigned",
           Title: func(data map[string]interface{}) string {
               return "You've been assigned to a task"
           },
           Message: func(data map[string]interface{}) string {
               taskTitle := data["task_title"].(string)
               assignerName := data["assigner_name"].(string)
               return fmt.Sprintf("%s assigned you to '%s'", assignerName, taskTitle)
           },
       },
       "task_commented": {
           Type: "task_commented",
           Title: func(data map[string]interface{}) string {
               return "New comment on your task"
           },
           Message: func(data map[string]interface{}) string {
               taskTitle := data["task_title"].(string)
               commenterName := data["commenter_name"].(string)
               return fmt.Sprintf("%s commented on '%s'", commenterName, taskTitle)
           },
       },
       "mentioned_in_comment": {
           Type: "mentioned_in_comment",
           Title: func(data map[string]interface{}) string {
               return "You were mentioned in a comment"
           },
           Message: func(data map[string]interface{}) string {
               taskTitle := data["task_title"].(string)
               mentionerName := data["mentioner_name"].(string)
               return fmt.Sprintf("%s mentioned you in a comment on '%s'", mentionerName, taskTitle)
           },
       },
   }
   ```

## File Structure Changes

```
offline_kanban/
├── pkg/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 003_create_notifications.go (new)
│   │   └── notifications.go (new)
│   ├── services/
│   │   ├── notification_service.go (new)
│   │   ├── notification_rules.go (new)
│   │   ├── mention_parser.go (new)
│   │   └── notification_templates.go (new)
│   └── models/
│       └── notification.go (new)
├── frontend/src/
│   ├── components/
│   │   └── Notifications/ (new)
│   │       ├── NotificationCenter.tsx
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationList.tsx
│   │       └── NotificationTypeIcon.tsx
│   ├── hooks/
│   │   └── useNotifications.tsx (new)
│   ├── services/
│   │   └── notificationService.ts (new)
│   └── types/
│       └── notification.ts (new)
```

## Notification Examples

### For Normal Users
```
"Task Assignment"
Title: "You've been assigned to a task"
Message: "John Doe assigned you to 'Design Homepage'"

"Comment on Your Task"
Title: "New comment on your task"
Message: "Jane Smith commented on 'Setup Database'"

"Mention in Comment"
Title: "You were mentioned"
Message: "Mike Johnson mentioned you in a comment on 'Deploy App'"

"Task Completed"
Title: "Your task was completed"
Message: "Sarah Wilson marked 'Design Homepage' as complete"
```

### For Root Users (Additional)
```
"System Events"
Title: "New user created"
Message: "Normal user 'alice@company.com' was created"

"Column Management"
Title: "Board column archived"
Message: "Column 'Testing' was archived"

"All Task Activity"
Title: "Task moved"
Message: "Bob moved 'API Development' from 'In Progress' to 'Done'"
```

## Success Criteria

- [ ] Root users receive all system notifications
- [ ] Normal users receive only relevant notifications (assigned, mentioned, commented)
- [ ] Mention system works with @username syntax
- [ ] Real-time notification updates (30-second polling initially)
- [ ] Notification bell shows unread count
- [ ] Click notifications navigate to related tasks
- [ ] Mark as read/unread functionality
- [ ] Delete individual notifications
- [ ] Mark all as read bulk action
- [ ] Notification persistence in database
- [ ] Clean up old notifications automatically

## Timeline Estimation

- **Phase 1**: 3-4 days (Database layer)
- **Phase 2**: 3-4 days (Targeting logic and mention parsing)
- **Phase 3**: 2-3 days (Backend API integration)
- **Phase 4**: 4-5 days (Frontend components)
- **Phase 5**: 2-3 days (Real-time updates - future)
- **Phase 6**: 2-3 days (Templates and polish)

**Total Estimated Time**: 16-22 days

## Phase 2 Enhancements

### Advanced Notification Features
- Email/SMS notification support (external messaging)
- Push notifications for desktop app
- Notification scheduling and batching
- Smart notification grouping (digest mode)

### Notification Customization
- User notification preferences per category
- Quiet hours and do-not-disturb modes
- Notification frequency controls
- Custom notification sounds and themes

### Real-time Features
- WebSocket integration for instant notifications
- Live notification updates without polling
- Real-time collaboration indicators
- Presence awareness (who's online)

### Notification Analytics
- Notification delivery tracking
- User engagement metrics
- Notification effectiveness analysis
- A/B testing for notification templates

### Integration Features
- Slack/Teams integration for notifications
- Mobile app push notification support
- Browser notification API integration
- Third-party notification service integration

## Notes

- Notifications are in-app only (no external messaging)
- Root users see all activity for administrative oversight
- Normal users see focused, relevant notifications only
- Mention system uses @username syntax for user tagging
- Notification cleanup prevents database bloat
- Template system ensures consistent messaging
- Real-time updates via polling (WebSocket enhancement later)
- Navigation integration for seamless task access
- Phase 2 features add external messaging and advanced customization