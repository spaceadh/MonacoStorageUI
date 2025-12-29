# MonacoStorage UI

MonacoStorage is a premium, secure file storage service designed to give users luxury-grade protection and management of their digital files on their on-premise cloud that lets it be shareable. Inspired by the exclusivity and security synonymous with Monaco, our platform offers a beautiful and intuitive dashboard experience.

## Features

- 🎨 **Modern UI with Aceternity Components** - Beautiful, animated components for a premium user experience
- 🔐 **Context-Aware Authentication** - React Context-based AuthProvider for seamless authentication state management
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🌙 **Dark Mode** - Beautiful dark theme enabled by default
- ⚡ **Next.js 16** - Built with the latest Next.js App Router for optimal performance
- 🎭 **Framer Motion Animations** - Smooth animations and transitions throughout the app
- 🎯 **TypeScript** - Full type safety for robust development

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Tabler Icons React
- **UI Components**: Custom Aceternity-inspired components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/spaceadh/MonacoStorageUI.git
cd MonacoStorageUI
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
MonacoStorageUI/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout with AuthProvider
│   ├── page.tsx          # Home page (redirects)
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Aceternity UI components
│   │   ├── sidebar.tsx
│   │   ├── background-gradient.tsx
│   │   └── bento-grid.tsx
│   └── DashboardLayout.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
└── lib/                # Utility functions
    └── utils.ts        # Helper utilities
```

## Authentication

The application uses a context-aware AuthProvider that manages authentication state throughout the app. 

### Using the AuthProvider

The AuthProvider is already set up in the root layout. To use authentication in your components:

```typescript
import { useAuth } from "@/contexts/AuthContext";

function YourComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state and methods
}
```

### Demo Login

For demonstration purposes, you can log in with any email and password combination. The authentication is currently mocked and stores user data in localStorage.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Components

### Aceternity UI Components

The project includes custom implementations of Aceternity UI components:

- **Sidebar**: Collapsible animated sidebar with navigation
- **Background Gradient**: Animated gradient backgrounds
- **Bento Grid**: Modern grid layout for dashboard cards

### Dashboard Layout

The dashboard features:
- Animated collapsible sidebar
- File management sections
- Storage usage statistics
- Recent activity tracking
- Security features

## Customization

### Colors & Theme

Modify `tailwind.config.ts` and `app/globals.css` to customize the theme.

### Adding New Pages

Create new pages in the `app` directory following Next.js App Router conventions.

### Authentication Backend

To connect to a real backend, update the `login` and `signup` methods in `contexts/AuthContext.tsx`.

## License

ISC

## Author

MonacoStorage Team
