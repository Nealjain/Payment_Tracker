# PayDhan - Expense Tracker

A modern expense tracking application built with Next.js, Supabase, and TypeScript.

## Features

- 💰 Track income and expenses
- 📊 Visual dashboard with charts
- 🏷️ Custom categories
- 💳 UPI ID management
- 👥 Group expenses (coming soon)
- 🔐 Secure authentication

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Custom session-based auth

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Your Supabase database should have the following tables:
- `users` - User accounts
- `user_preferences` - User settings and onboarding data
- `categories` - Income/expense categories
- `upi_ids` - UPI payment IDs
- `payments` - Transaction records
- `dues` - Money owed/owing tracking

RLS (Row Level Security) is disabled as the app uses custom session-based authentication.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── payments/          # Payments page
│   ├── categories/        # Categories page
│   └── upi/               # UPI management page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client
│   ├── auth.ts           # Authentication logic
│   └── session.ts        # Session management
└── public/               # Static assets
```

## License

MIT
