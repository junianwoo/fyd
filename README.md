# Find Your Doctor

A modern web application to help patients find doctors accepting new patients in Ontario, Canada.

## Features

- **Doctor Search**: Search for doctors by location, specialty, and accepting status
- **Interactive Map**: View doctor locations on an interactive map with filters
- **Community Reports**: Users can report doctor availability status
- **User Authentication**: Secure authentication powered by Supabase
- **Admin Dashboard**: Manage doctors, resources, and user reports
- **Resources Section**: Educational articles and guides
- **Alert Service**: Get notified when doctors start accepting patients (premium feature)
- **Assisted Access**: Special access program for underserved communities

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Backend & Auth**: Supabase
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- (Optional) Google Maps API key for map functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/junianwoo/fyd.git
   cd fyd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your Supabase database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL from `MIGRATION_GUIDE.sql`

4. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key (optional)
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
fyd/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Page components
│   └── main.tsx          # Application entry point
├── supabase/
│   ├── functions/        # Supabase Edge Functions
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## Database Schema

The application uses the following main tables:

- `doctors` - Doctor profiles and clinic information
- `profiles` - User profiles linked to auth.users
- `community_reports` - Status reports submitted by the community
- `alert_settings` - User alert preferences
- `resources` - Blog posts and articles
- `user_roles` - Role-based access control
- `pending_updates` - Aggregated community updates awaiting approval
- `verification_tokens` - Magic links for doctor profile claiming

## Deployment

### Deploy to Vercel

1. **Create a Vercel account** at https://vercel.com

2. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   - Push your code to GitHub
   - Import the project in Vercel dashboard
   - Add environment variables in Vercel project settings
   - Deploy!

4. **Configure Supabase Auth URLs**
   - In Supabase dashboard, go to Authentication → URL Configuration
   - Add your Vercel domain to allowed redirect URLs
   - Add your Vercel domain to site URL

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

Optional:
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key for map features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
