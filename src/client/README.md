# Vue 3 Admin Dashboard Client

A modern Vue 3 application for the Fraud Detection Engine with authentication, multi-tenancy, and role-based access control.

## Features

- **Vue 3 Composition API**: Modern reactive state management
- **Vue Router 4**: Client-side routing with navigation guards
- **Bootstrap 5**: Responsive UI components
- **Font Awesome**: Icon library
- **Axios**: HTTP client for API communication
- **Vite**: Fast development server and build tool

## Components

### Login (`/login`)

- Email/password authentication
- OAuth/SSO support
- Tenant population on email blur
- Multi-tenant selection
- Form validation and error handling

### Dashboard (`/dashboard`)

- User information display
- Role and permission badges
- Tenant information
- Quick action buttons
- Responsive layout

### Tenant Selection (`/tenant-selection`)

- Multi-tenant interface
- Visual tenant cards
- Tenant selection workflow

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start on `http://localhost:3001` with proxy configuration to the Express backend at `http://localhost:3000`.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The client is configured to work with the Express backend:

- **Base URL**: `http://localhost:3000` (via proxy)
- **Authentication**: Session-based with Passport.js
- **Multi-tenancy**: Tenant selection and validation
- **RBAC**: Role and permission management

## Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
```

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── views/         # Page components
│   ├── router/        # Vue Router configuration
│   ├── services/      # API service functions
│   ├── stores/        # State management (future)
│   ├── assets/        # Static assets
│   ├── App.vue        # Root component
│   └── main.js        # Application entry point
├── public/            # Static files
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies and scripts
```

## Backend Integration

This client is designed to work with the Express.js backend that provides:

- `/auth/login` - User authentication
- `/auth/oauth` - OAuth authentication
- `/auth/check-user` - User existence check
- `/auth/oauth-config` - OAuth configuration
- `/t/:tenantId/vue-dashboard` - Tenant-specific dashboard

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

ISC
