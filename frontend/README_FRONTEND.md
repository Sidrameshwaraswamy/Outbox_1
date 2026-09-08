# ReachInbox Frontend

A modern React + TypeScript frontend for managing email campaigns with Google OAuth authentication.

## Features

- ✅ **Google OAuth Authentication** - Secure login with Google
- ✅ **Dashboard** - Main UI with stats and email management
- ✅ **Scheduled Emails** - View and manage scheduled email campaigns
- ✅ **Sent Emails** - Track sent emails and their status
- ✅ **Compose New Email** - Create and schedule email campaigns
  - Subject and body editing
  - CSV/TXT file upload for email leads
  - Set start time, delay between sends, and hourly limit
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Component-based Architecture** - Reusable UI components
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern styling

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── emails/          # Email-related components
│   │   │   ├── EmailsTable.tsx
│   │   │   └── ComposeModal.tsx
│   │   ├── stats/           # Stats components
│   │   │   └── StatsCard.tsx
│   │   └── pages/           # Page components
│   │       ├── LoginPage.tsx
│   │       └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts           # API client
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── utils/
│   │   └── helpers.ts       # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── styles.css           # Global styles
├── .env                     # Environment variables
├── .env.example             # Example environment variables
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── vite.config.ts           # Vite config
```

## Setup Instructions

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Google OAuth credentials (Client ID)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:
   ```
   VITE_API_URL=http://localhost:4000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

   **To get Google Client ID:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs: `http://localhost:5173`
   - Copy the Client ID to your `.env` file

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Type checking**
   ```bash
   npm run typecheck
   ```

## API Endpoints Used

The frontend expects the backend to provide these endpoints:

### Authentication
- `GET /api/me` - Get current user info
- `POST /api/auth/google` - Login with Google token
- `POST /api/auth/logout` - Logout

### Emails
- `GET /api/emails?status=SCHEDULED|SENT&search=...` - Get emails with optional search
- `POST /api/emails/schedule` - Schedule new emails

## Component Documentation

### Button Component
Reusable button with variants (primary, secondary, danger, ghost) and sizes (sm, md, lg).

```tsx
<Button variant="primary" size="md" icon={<Plus />} isLoading={false}>
  Click me
</Button>
```

### Input Component
Text input with label, error message, and optional icon support.

```tsx
<Input
  label="Email"
  placeholder="user@example.com"
  error={error}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Modal Component
Modal dialog with title, description, and close button.

```tsx
<Modal isOpen={true} title="Compose Email" onClose={handleClose} size="lg">
  {/* Modal content */}
</Modal>
```

### EmptyState Component
Displays empty state message with icon.

```tsx
<EmptyState
  title="No emails yet"
  description="Schedule your first email to see it here"
  icon={<FileText />}
/>
```

### LoadingSpinner Component
Shows loading spinner with optional message.

```tsx
<LoadingSpinner message="Loading emails..." />
```

### Toast Component
Toast notification with auto-dismiss.

```tsx
<Toast
  message="Email scheduled successfully"
  type="success"
  onClose={() => setToast(null)}
  duration={5000}
/>
```

## Styling

The project uses **Tailwind CSS** for styling. All components use Tailwind utility classes for consistent, responsive design.

Key theme colors:
- Primary: `indigo-600` (#4f46e5)
- Success: `green-600` (#16a34a)
- Warning: `orange-600` (#ea580c)
- Danger: `red-600` (#dc2626)

## Error Handling

The frontend includes comprehensive error handling:
- API errors show toast notifications
- Form validation displays inline error messages
- Loading states prevent duplicate submissions
- Empty states guide users when no data is available

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Code Quality
- Full TypeScript type safety
- Reusable components to avoid duplication
- Clean separation of concerns
- Consistent naming conventions

### Performance
- Code splitting via Vite
- Lazy loading of components
- Optimized re-renders with React hooks

## Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Google OAuth not working
- Verify your Client ID in `.env`
- Check authorized redirect URIs in Google Cloud Console
- Ensure the domain matches your development URL

### API connection errors
- Make sure backend is running on `http://localhost:4000`
- Check `VITE_API_URL` in `.env`
- Verify CORS settings on backend

## Contributing

1. Create feature branches from `main`
2. Keep components focused and reusable
3. Write TypeScript interfaces for all props
4. Test responsive design on mobile devices

## License

MIT
