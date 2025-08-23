# Normal User Creation Plan

## Overview
This document outlines the plan for implementing normal user creation functionality in the Offline Kanban Desktop App. Normal users have limited permissions compared to root users and can only perform specific actions within the system.

## Current Database Schema (IMPLEMENTED)
Based on the existing users table structure in `pkg/database/database.go:41-47`:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_root BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Existing Features:**
- ✅ Basic user structure
- ✅ Root user support
- ✅ Username/password authentication
- ✅ Creation timestamp
- ✅ Auto-update triggers implemented

## Missing Database Schema Fields

The current schema needs to be extended to support the additional user fields:

```sql
-- Migration needed to add:
ALTER TABLE users ADD COLUMN name TEXT;                           -- Full name of the user
ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;  -- Last update timestamp  
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1;        -- Active status for soft delete
```

**Target Enhanced Schema:**
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                           -- TO ADD: Full name of the user
    username TEXT UNIQUE NOT NULL,               -- EXISTING: Unique identifier
    password TEXT NOT NULL,                      -- EXISTING: Hashed password
    is_root BOOLEAN NOT NULL DEFAULT 0,         -- EXISTING: Root user flag
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- EXISTING: Creation timestamp
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- TO ADD: Last update timestamp
    is_active BOOLEAN NOT NULL DEFAULT 1        -- TO ADD: Active status for soft delete
)
```

## User Permissions Matrix

| Action | Root User | Normal User |
|--------|-----------|-------------|
| Create other users | ✅ Yes | ❌ No |
| Delete/Remove other users | ✅ Yes | ❌ No |
| Create tasks | ✅ Yes | ✅ Yes |
| Edit own tasks | ✅ Yes | ✅ Yes |
| Edit other's tasks | ✅ Yes | ❌ No |
| Delete/Archive tasks | ✅ Yes | ❌ No |
| View all tasks | ✅ Yes | ✅ Yes (read-only for others) |
| Manage board columns | ✅ Yes | ❌ No |

## Implementation Plan

### Phase 1: Database Updates
1. **Current Status**: ✅ Basic users table exists with auto-update triggers
2. **Migration Needed**: Add missing fields to existing table
   ```go
   // pkg/database/migrations/002_enhance_users.go
   func EnhanceUsersTable(db *sql.DB) error {
       // Add: name, updated_at, is_active fields
       // Populate existing users with default values
   }
   ```
3. **Update Existing Methods**: Modify `AddUser` to handle new fields

2. **Database Methods Status**
   - ✅ `AddUser(username, password)` exists - needs name parameter
   - ✅ `ValidateUser(username, password)` exists - working
   - ❌ `CreateRootUser` - TO BE ADDED
   - ❌ `UpdateUser` - TO BE ADDED for profile updates
   - ❌ `DeactivateUser` - TO BE ADDED for soft delete
   - ❌ `GetAllUsers` - TO BE ADDED for user management

### Phase 2: Backend API Updates
1. **Update Go Structs**
   - Create `User` struct with all fields
   - Create `CreateUserRequest` struct for API
   - Create `UpdateUserRequest` struct for updates

2. **Update App Methods in `app.go`**
   - Modify existing `AddUser(username, password string)` to `AddUser(name, username, password string)`
   - Add `GetAllUsers()` method
   - Add `UpdateUser(id, name, username string)` method
   - Add `DeactivateUser(id int)` method
   - Add `GetCurrentUserProfile(username string)` method

3. **Add Permission Validation**
   - Create `isRootUser(username string)` helper method
   - Add permission checks in all user management methods
   - Implement middleware for role-based access control

### Phase 3: Frontend Updates
1. **User Management Interface (Root Only)**
   - Create `UserManagement.tsx` component
   - Add user listing with search/filter functionality
   - Add "Add User" modal form with name, username, password fields
   - Add user edit/deactivate functionality
   - Add user creation success/error handling

2. **User Profile Management**
   - Create `UserProfile.tsx` component for self-profile management
   - Allow users to update their own name and password
   - Add profile validation and error handling

3. **Navigation & Authorization**
   - Add conditional navigation menu based on user role
   - Hide user management section from normal users
   - Add role-based component rendering throughout the app

### Phase 4: Validation & Security
1. **Input Validation**
   - Name: Required, 2-50 characters, no special characters except spaces, hyphens, apostrophes
   - Username: Required, unique, 3-50 characters, support email/phone formats
   - Password: Minimum 8 characters, at least one uppercase, lowercase, number

2. **Security Enhancements**
   - Implement rate limiting for user creation
   - Add audit logging for user management actions
   - Ensure password hashing is consistent
   - Add session management for role verification

### Phase 5: UI/UX Enhancements
1. **User Interface Components**
   - User avatar/initials display
   - User role badges
   - User status indicators (active/inactive)
   - Responsive user management table

2. **User Experience**
   - Add confirmation dialogs for user deactivation
   - Implement proper loading states
   - Add success/error toast notifications
   - Implement proper form validation feedback

## File Structure Changes

```
offline_kanban/
├── pkg/
│   ├── database/
│   │   ├── database.go (updated)
│   │   ├── migrations.go (new)
│   │   └── user.go (new - user-specific DB operations)
│   ├── models/
│   │   └── user.go (new - user structs)
│   └── middleware/
│       └── auth.go (new - permission middleware)
├── frontend/src/
│   ├── components/
│   │   ├── UserManagement/ (new)
│   │   │   ├── UserList.tsx
│   │   │   ├── AddUserModal.tsx
│   │   │   ├── EditUserModal.tsx
│   │   │   └── UserCard.tsx
│   │   └── UserProfile/ (new)
│   │       ├── ProfileView.tsx
│   │       └── EditProfile.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx (new)
│   │   └── useUsers.tsx (new)
│   └── services/
│       └── userService.ts (new)
```

## Testing Strategy

### Backend Tests
- Unit tests for all new database methods
- Integration tests for user creation/management APIs
- Permission validation tests
- Migration tests

### Frontend Tests
- Component tests for user management interfaces
- Role-based rendering tests
- Form validation tests
- User interaction flow tests

## Migration Strategy

1. **Database Migration**
   - Create backup of existing database
   - Run migration script to add new columns
   - Populate existing users with default values for new fields

2. **Backwards Compatibility**
   - Maintain existing API signatures initially
   - Gradually deprecate old methods
   - Ensure existing root user functionality remains intact

## Success Criteria

- [ ] Root users can create normal users with name, username, and password
- [ ] Normal users cannot access user management functions
- [ ] Normal users cannot delete or archive tasks
- [ ] Normal users can create and manage their own tasks
- [ ] All user data is properly validated and secured
- [ ] Database migrations work correctly
- [ ] Frontend properly enforces role-based permissions
- [ ] All existing functionality remains intact

## Timeline Estimation

- **Phase 1**: 2-3 days (Database updates)
- **Phase 2**: 3-4 days (Backend API)
- **Phase 3**: 4-5 days (Frontend implementation)
- **Phase 4**: 2-3 days (Validation & Security)
- **Phase 5**: 2-3 days (UI/UX polish)

**Total Estimated Time**: 13-18 days

## Phase 2 Enhancements

### User Profile Management
- User profile page for editing personal information
- Password change functionality for self-service
- Avatar upload and management
- Personal preferences (theme, language, timezone)

### Advanced User Administration  
- User deactivation/reactivation instead of deletion
- Session management and active session viewing
- Admin-initiated password resets
- Enhanced user role management system

### User Experience Improvements
- User onboarding flow for first-time users
- Interactive user guide and help system
- User activity tracking and engagement metrics

## Notes

- Username field supports flexible formats (email, phone, or custom identifier)
- Soft delete approach for users to maintain data integrity
- Role-based permissions are enforced both on backend and frontend
- All user management actions are logged for audit purposes
- Password requirements can be configured in future updates
- Phase 2 features extend user management with self-service capabilities