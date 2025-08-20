# Offline Kanban Desktop App

A powerful, offline-first Kanban board desktop application built with Go, Wails, and React. Perfect for teams and individuals who need a secure, local task management solution without relying on cloud services.

## 🌟 Features

### User Management
- **Root User Setup**: First-time setup creates a root administrator account
- **User Creation**: Root users can create and manage normal user accounts
- **Role-based Access**: Differentiated permissions between root and normal users

### Task Management
- **Interactive Kanban Board**: Drag-and-drop task management with customizable columns
- **Task Creation**: Both root and normal users can create tasks
- **Auto-archiving**: Tasks can be set to auto-archive after 90 days or remain permanent
- **Rich Task Details**: Tasks include title, content, assignee, comments, and history tracking
- **Future-ready**: Architecture supports upcoming features like image attachments

### Task Organization
- **Comprehensive Task View**: Dedicated page to view all tasks across the board
- **Advanced Filtering**: Filter tasks by:
  - User/assignee
  - Date ranges
  - Content/description
  - Task title
  - Comments (when available)
- **Task States**: Support for archived and active task management

## 🛠 Technology Stack

- **Backend**: Go with SQLite database
- **Desktop Framework**: Wails v2
- **Frontend**: React with TypeScript
- **UI**: Tailwind CSS with custom UI components
- **State Management**: React hooks and context

## 📋 Prerequisites

- Go 1.19 or higher
- Node.js 16 or higher
- Wails CLI v2

## 🚀 Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd offline_kanban
   ```

2. Install dependencies:
   ```bash
   # Install Wails CLI if not already installed
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

### Development

Run the application in development mode with hot reload:

```bash
wails dev
```

This starts a development server with:
- Hot reload for frontend changes
- Backend Go code compilation
- Debug access at http://localhost:34115

### Building

Create a production build:

```bash
wails build
```

The built application will be available in the `build/bin` directory.

## 🔧 Project Structure

```
offline_kanban/
├── app.go                  # Main application logic and API methods
├── main.go                # Application entry point
├── pkg/
│   ├── database/          # Database operations and schema
│   └── util/             # Utility functions (password hashing, etc.)
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── View/        # Application views/pages
│   │   └── hook/        # Custom React hooks
│   └── wailsjs/         # Generated Wails bindings
└── db/                  # SQLite database storage (created at runtime)
```

## 💡 Usage

### First Run
1. Launch the application
2. Complete the root user setup when prompted
3. Start creating users and organizing tasks on your Kanban board

### Managing Users
- **Root users** can create new user accounts and manage all tasks
- **Normal users** can create and manage their own tasks

### Task Workflow
1. Create tasks in the "To Do" column
2. Move tasks through "In Progress" to "Done" using drag-and-drop
3. Set auto-archive preferences during task creation
4. Use the task overview page for comprehensive task management

## 🔮 Planned Features

- Image attachments for tasks
- Enhanced comment system
- Task templates
- Export functionality
- Advanced reporting and analytics
- Customizable board layouts

## 📝 Configuration

Project configuration can be modified in `wails.json`. For more details, visit the [Wails documentation](https://wails.io/docs/reference/project-config).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
