# Velo Market - P2P Artifact Exchange Protocol

A highly secure, PGP-integrated, decentralized-aesthetic marketplace for digital artifacts and services.

## Features
- **PGP Encryption**: Automatic key generation and end-to-end encrypted messaging.
- **Multi-Role System**: Admin, Reseller, and User roles with specialized dashboards.
- **Dispute Resolution**: Dedicated arbitration workflow for conflict management.
- **Economy Dashboard**: Real-time tracking of VELO coin supply and transaction volume.
- **Crypto Integration**: Buy VELO coins with transaction proof (TXID) validation.
- **Wishlist & Notifications**: Stay updated on trending artifacts.
- **Global Reach**: Multi-language support and location-based artifact filtering.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion.
- **Backend/Database**: Supabase (PostgreSQL + Auth).
- **Encryption**: OpenPGP.js.

## Setup Instructions

### 1. Supabase Configuration
1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor**.
3. Copy the contents of `supabase.sql` and execute it to set up the database schema.
4. Go to **Project Settings -> API** and get your `Project URL` and `Anon Key`.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key (for AI features)
```

### 3. Installation
```bash
npm install
```

### 4. Local Development
```bash
npm run dev
```

### 5. Deployment
The app is optimized for Cloud Run. Ensure `NODE_ENV=production` is set during build.
```bash
npm run build
npm start
```

## Security Protocol
- Password length enforced: 6 characters minimum.
- Secret passcode required for sensitive operations.
- Admin panel protected by additional password layer.

## Contribution
Submit internal pull requests via the terminal protocol.
