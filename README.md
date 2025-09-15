# Offline Kanban Board

A modern, feature-rich offline Kanban board application built with React frontend and Wails backend, designed for efficient task management with comprehensive dark theme support and responsive design.

## ✨ Features

### 🎯 Core Functionality
- **Kanban Board Management**: Drag-and-drop task management with customizable columns
- **Task Creation & Management**: Comprehensive task creation with validation
- **Offline First**: Works completely offline with local data persistence
- **Cross-Platform**: Desktop application for Windows, macOS, and Linux

### 🎨 User Interface
- **Modern React UI**: Built with React + TypeScript + Tailwind CSS
- **Comprehensive Dark Theme**: Full dark/light mode support with system preference detection
- **Responsive Design**: Mobile-first approach with touch-friendly interface
- **Theme Toggle**: Sun/Moon icons for easy theme switching
- **Smooth Transitions**: CSS transitions for seamless theme switching

### 🧭 Navigation & Routing
- **React Router Integration**: Modern SPA routing with active state management
- **Multi-Page Application**:
  - **Dashboard** (`/`) - Main Kanban board view
  - **Tasks** (`/tasks`) - Task search and management
  - **Users** (`/users`) - User management system
  - **Settings** (`/settings`) - Application settings
- **Mobile Navigation**: Hamburger menu with responsive breakpoints

### 📝 Task Management
- **Rich Task Creation**: Comprehensive form with validation
- **Task Properties**:
  - Title (required, 3-100 characters)
  - Description (optional, max 1000 characters)
  - Priority levels (Low/Medium/High/Urgent)
  - Column assignment (To Do/In Progress/Done)
  - Auto-archive settings (1-365 days)
- **Form Validation**: react-hook-form with proper error handling
- **Toast Notifications**: Success/error feedback system

### 🛠️ Technical Features
- **TypeScript Support**: Full type safety throughout the application
- **Component Library**: Reusable UI components with consistent styling
- **Form Management**: Advanced form handling with react-hook-form
- **State Management**: Efficient state management with React hooks
- **Icon System**: Heroicons integration for consistent iconography

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Wails (Go-based desktop framework)
- **UI Library**: react-kanban-kit for Kanban functionality
- **Icons**: Heroicons
- **Routing**: React Router DOM
- **Forms**: react-hook-form with validation
- **Build Tool**: Vite for fast development and building

### Project Structure
```
├── frontend/src/
│   ├── components/
│   │   ├── KanbanBoard.tsx
│   │   ├── Tasks/
│   │   │   └── CreateTaskForm.tsx
│   │   └── ui/
│   │       ├── Navbar/
│   │       ├── Modal/
│   │       ├── Input/
│   │       └── FormGroup.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   └── useDarkMode.tsx
│   └── App.tsx
├── wails.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- [Wails](https://wails.io/docs/gettingstarted/installation) installed
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Go](https://golang.org/) (v1.18 or higher)

### Installation
1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Development
To run in live development mode with hot reload:
```bash
wails dev
```

This will start:
- A Vite development server for fast frontend hot reload
- A dev server at http://localhost:34115 for browser-based development with Go method access

### Building
To build a redistributable, production package:
```bash
wails build
```

## 🎨 Theme System

### Dark Mode Features
- **Automatic Detection**: Respects system dark/light preference
- **Manual Toggle**: Theme switcher in navigation bar
- **Persistent Storage**: Theme preference saved in localStorage
- **Comprehensive Coverage**: All components support both themes
- **Accessibility**: Proper contrast ratios and ARIA labels

### Supported Components
- Navigation bar with active states
- Modal dialogs and overlays
- Form inputs and validation messages
- Kanban board columns and cards
- Toast notifications
- All UI components

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices first
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Hamburger Menu**: Collapsible navigation for mobile devices
- **Flexible Layouts**: Grid and flexbox layouts that adapt to screen size

## 🔄 Current Status

### ✅ Completed Features
- [x] React Router setup with multi-page navigation
- [x] Comprehensive dark theme implementation
- [x] Task creation UI with form validation
- [x] Responsive navigation bar
- [x] Modal system with theme support
- [x] Toast notification system
- [x] Reusable UI component library

### 🚧 In Progress
- Backend integration for task persistence
- User authentication system
- Real-time task updates

### 🔮 Planned Features
- Task comments and history
- File attachments
- Task dependencies
- Auto-archive system
- Export/import functionality
- Real-time collaboration

## 👨‍💻 Author
**Parvej Ahammad**
- Email: parvej.code@gmail.com

## 📄 License
This project is built using the Wails framework and follows their licensing terms.
