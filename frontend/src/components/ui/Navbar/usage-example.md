# Navbar Component Usage

## Basic Usage

```tsx
import { Navbar } from './components/ui/Navbar/Navbar';

function App() {
  const menuItems = [
    { label: 'Dashboard', href: '/', active: true },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Users', href: '/users' },
    { label: 'Settings', href: '/settings' }
  ];

  return (
    <div>
      <Navbar 
        brand="My App" 
        menuItems={menuItems} 
      />
      {/* Rest of your app */}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `brand` | `string` | `"Offline Kanban"` | Brand/title text shown on the left |
| `menuItems` | `MenuItem[]` | `[]` | Array of menu items |
| `className` | `string` | `""` | Additional CSS classes |

## MenuItem Interface

```tsx
interface MenuItem {
  label: string;    // Text to display
  href: string;     // URL/route to navigate to
  active?: boolean; // Whether this item is currently active
}
```

## Examples

### Simple navbar with basic items
```tsx
const basicMenu = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

<Navbar menuItems={basicMenu} />
```

### Navbar with active state
```tsx
const menuWithActive = [
  { label: 'Dashboard', href: '/', active: true },
  { label: 'Projects', href: '/projects' },
  { label: 'Team', href: '/team' }
];

<Navbar brand="Project Manager" menuItems={menuWithActive} />
```

### Custom styled navbar
```tsx
<Navbar 
  brand="Custom App"
  menuItems={menuItems}
  className="bg-blue-600 text-white"
/>
```

## Features

- ✅ Responsive design (mobile hamburger menu)
- ✅ Active state styling
- ✅ Hover effects
- ✅ Tailwind CSS styling
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Mobile-first approach