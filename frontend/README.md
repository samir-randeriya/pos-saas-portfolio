# POS SaaS Portfolio - Frontend

React + Vite frontend application for a multi-tenant POS SaaS system with subscription management.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY=your_razorpay_test_key_here
```

**Important:** Replace `your_razorpay_test_key_here` with your actual Razorpay Test Key ID from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_RAZORPAY_KEY` | Razorpay Key ID (public key) | Yes |

**Note:** All environment variables must have the `VITE_` prefix to be accessible in the frontend code.

## Getting Razorpay Keys

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to **Settings** → **API Keys** in the dashboard
3. Generate **Test Mode** keys for development
4. Copy the **Key ID** (starts with `rzp_test_`)
5. Add it to your `.env` file as `VITE_RAZORPAY_KEY`

## Application Structure

```
src/
├── admin/              # Admin pages (users, subscriptions)
├── auth/               # Authentication pages (login, register)
├── client/             # Client pages (dashboard, billing)
├── components/         # Reusable components
├── context/            # React context providers
├── pages/              # Public pages (landing)
├── routes/             # Route configuration
├── services/           # API services
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Available Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### Client Routes (Protected)
- `/app/dashboard` - Client dashboard with modules
- `/app/billing` - Subscription upgrade page

### Admin Routes (Protected, Admin Only)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management with impersonation
- `/admin/subscriptions` - Subscription monitoring

## Features

- ✅ Multi-tenant authentication with role-based access
- ✅ Client dashboard with subscription plans
- ✅ Razorpay payment integration
- ✅ Admin impersonation functionality
- ✅ Responsive design with Tailwind CSS
- ✅ Protected routes with loading states
- ✅ Error handling throughout

## Payment Testing

For testing Razorpay payments, use these test card details:
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

## Troubleshooting

### 401 Unauthorized from Razorpay
- Verify your `VITE_RAZORPAY_KEY` is correct in `.env`
- Make sure you're using the correct key (test vs live)
- Restart the dev server after changing `.env`

### API Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env` matches backend URL
- Verify CORS is properly configured in backend

### Environment Variables Not Working
- Restart the Vite dev server after creating/modifying `.env`
- Ensure variable names start with `VITE_` prefix
- Check `.env` file is in the frontend root directory

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Razorpay** - Payment gateway

## Security Notes

- Never commit `.env` files to version control
- Use test keys during development
- Keep `RAZORPAY_KEY` (public) separate from `RAZORPAY_SECRET` (backend only)
- Always validate payments on the backend
