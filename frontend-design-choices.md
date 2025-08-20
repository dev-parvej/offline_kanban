# Frontend Design Choices

## Technology Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 3+ with custom design system
- **State Management**: React Context + useReducer for complex state
- **Build Tool**: Vite (already configured with Wails)
- **Icons**: Heroicons or Lucide React
- **Drag & Drop**: @dnd-kit/core for Kanban functionality

## Design System Foundation

### Color Palette
```css
/* Primary Colors */
--blue-50: #eff6ff;
--blue-500: #3b82f6;  /* Primary brand */
--blue-600: #2563eb;  /* Primary dark */
--blue-700: #1d4ed8;  /* Primary darker */

/* Semantic Colors */
--green-500: #10b981; /* Success */
--yellow-500: #f59e0b; /* Warning */
--red-500: #ef4444;   /* Error/Danger */
--gray-500: #6b7280;  /* Neutral */

/* Task Priority Colors */
--priority-low: #10b981;    /* Green */
--priority-medium: #f59e0b; /* Yellow */
--priority-high: #f97316;   /* Orange */
--priority-urgent: #ef4444; /* Red */

/* Background & Surface */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
--surface: #ffffff;
--surface-elevated: #ffffff;
```

### Typography Scale
```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Spacing System
- **Base unit**: 4px (0.25rem)
- **Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
- **Component padding**: Usually 4, 6, or 8 (16px, 24px, 32px)
- **Layout margins**: Usually 6, 8, 12, or 16 (24px, 32px, 48px, 64px)

### Border Radius
- **Small**: 0.25rem (4px) - buttons, badges
- **Medium**: 0.5rem (8px) - cards, inputs
- **Large**: 0.75rem (12px) - modals, panels
- **X-Large**: 1rem (16px) - special elements

## Layout Structure

### Application Shell
```
┌─────────────────────────────────────┐
│              Header                 │
│  [Logo] [Nav] [Search] [Notifications] [User] │
├─────────────────────────────────────┤
│                                     │
│            Main Content             │
│         (Page Components)           │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Page Layouts

#### Board Page Layout
```
┌─────────────────────────────────────┐
│  Board Header + Filters             │
├─────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │Col 1│  │Col 2│  │Col 3│  │Col 4│ │
│  │     │  │     │  │     │  │     │ │
│  │[Task]│ │[Task]│ │[Task]│ │     │ │
│  │[Task]│ │[Task]│ │     │  │     │ │
│  │     │  │     │  │     │  │     │ │
│  └─────┘  └─────┘  └─────┘  └─────┘ │
└─────────────────────────────────────┘
```

#### Task List Page Layout
```
┌─────────────────────────────────────┐
│  Search & Filters Bar               │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐   │
│  │     Task List Table           │   │
│  │ □ Task 1    User   Priority   │   │
│  │ □ Task 2    User   Priority   │   │
│  │ □ Task 3    User   Priority   │   │
│  │ □ Task 4    User   Priority   │   │
│  └───────────────────────────────┘   │
├─────────────────────────────────────┤
│           Pagination                │
└─────────────────────────────────────┘
```

## Component Architecture

### Atomic Design Structure
```
src/components/
├── ui/              # Atomic components
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   ├── Card/
│   └── Badge/
├── features/        # Feature-specific components
│   ├── Board/
│   ├── Tasks/
│   ├── Users/
│   ├── Columns/
│   └── Notifications/
├── layout/          # Layout components
│   ├── Header/
│   ├── Navigation/
│   └── Shell/
└── pages/           # Page components
    ├── BoardPage/
    ├── TaskListPage/
    ├── UserListPage/
    └── ColumnListPage/
```

## Modal Design Strategy

### Modal Types and Usage
1. **Small Modal (320px)**: Confirmations, simple forms
2. **Medium Modal (480px)**: Standard CRUD forms
3. **Large Modal (640px)**: Complex forms, task details
4. **Full Screen Modal (Mobile)**: Any modal on small screens

### Modal Components Hierarchy
```
<Modal>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <ModalTitle />
      <ModalCloseButton />
    </ModalHeader>
    <ModalBody>
      {/* Content */}
    </ModalBody>
    <ModalFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## Component Design Specifications

### Task Card Component
```
┌─────────────────────────┐
│ [Priority Badge]        │
│ Task Title              │
│ Task Description...     │
│                         │
│ [Assignee] [Comments: 3]│
│ [Due Date]         [⋮]  │
└─────────────────────────┘
```

### User Card Component
```
┌─────────────────────────┐
│ [Avatar] John Doe       │
│          john@email.com │
│                         │
│ [Root Badge] [Active]   │
│ Created: Jan 15, 2024   │
└─────────────────────────┘
```

### Column Header Component
```
┌─────────────────────────┐
│ Column Title      [⋮]   │
│ 5 tasks          [+]    │
└─────────────────────────┘
```

## Responsive Breakpoints

### Tailwind Breakpoints
- **sm**: 640px (tablets)
- **md**: 768px (small desktops)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large desktops)
- **2xl**: 1536px (extra large)

### Responsive Strategy
- **Mobile First**: Design for mobile, enhance for larger screens
- **Board**: Stack columns vertically on mobile, horizontal scroll on tablet+
- **Modals**: Full screen on mobile, centered on larger screens
- **Tables**: Horizontal scroll on mobile, full width on desktop

## Animation Guidelines

### Micro-interactions
- **Button hover**: `transform: translateY(-1px)` + shadow increase
- **Card hover**: Subtle shadow elevation
- **Modal enter**: `scale(0.95) -> scale(1)` with fade
- **Drag feedback**: `rotate(3deg)` + shadow

### Transition Timings
- **Fast**: 150ms (hover states)
- **Medium**: 250ms (modals, page transitions)
- **Slow**: 350ms (complex animations)

### Easing Functions
- **Ease-out**: Most UI interactions
- **Ease-in-out**: Modals and overlays
- **Spring**: Drag and drop feedback

## Accessibility Considerations

### WCAG 2.1 Compliance
- **Color contrast**: Minimum 4.5:1 for normal text
- **Focus indicators**: Visible focus rings on all interactive elements
- **Keyboard navigation**: Tab order and arrow key navigation
- **Screen reader support**: Proper ARIA labels and roles
- **Touch targets**: Minimum 44px for mobile interactions

### Implementation Details
- Use `focus-visible:` instead of `focus:` for better UX
- Include `sr-only` text for icon-only buttons
- Proper heading hierarchy (h1, h2, h3...)
- Form labels associated with inputs
- Loading states announced to screen readers

## State Management Strategy

### Context Structure
```typescript
// Global state contexts
AuthContext          // User authentication and permissions
ThemeContext         // UI theme and preferences
NotificationContext  // Notification system

// Feature-specific contexts
BoardContext         // Board and column state
TaskContext          // Task management state
UserContext          // User management state (root only)
```

### State Shape Examples
```typescript
interface BoardState {
  columns: Column[];
  tasks: { [columnId: string]: Task[] };
  filters: BoardFilters;
  loading: boolean;
  error: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  loading: boolean;
}
```

## Performance Considerations

### Code Splitting
- Lazy load pages with `React.lazy()`
- Separate vendor bundles
- Dynamic imports for heavy features

### Optimization Strategies
- **React.memo()** for expensive list items
- **useMemo()** for complex calculations
- **useCallback()** for event handlers in lists
- **Virtual scrolling** for large task lists
- **Image optimization** for user avatars

### Bundle Size Targets
- **Initial bundle**: < 200KB gzipped
- **Total bundle**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## Icon Strategy

### Icon Library Choice
**Heroicons** - Clean, consistent, lightweight SVG icons
- Outline style for general use
- Solid style for emphasis and buttons
- Mini style for small UI elements

### Icon Usage Guidelines
- **Size**: 16px (small), 20px (medium), 24px (large)
- **Color**: Inherit from parent or use semantic colors
- **Accessibility**: Include aria-label or sr-only text
- **Consistency**: Use same style throughout feature areas

## Error Handling UI

### Error States
1. **Field Errors**: Inline validation with red border + message
2. **Form Errors**: Error summary at top of form
3. **Page Errors**: Full page error state with retry action
4. **Network Errors**: Toast notifications with retry option

### Error Message Tone
- Clear and actionable
- No technical jargon
- Suggest solutions when possible
- Friendly but professional

## Loading States Strategy

### Loading Patterns
1. **Skeleton Loading**: For cards and lists
2. **Spinner**: For buttons and small actions
3. **Progress Bar**: For file uploads
4. **Shimmer Effect**: For placeholder content

### Loading State Hierarchy
1. Show skeleton/placeholder immediately
2. Replace with spinner if loading continues
3. Show partial content as it loads
4. Complete with full content + success indication

This design system provides a solid foundation for building a consistent, accessible, and performant React + Tailwind CSS frontend for the Offline Kanban application.