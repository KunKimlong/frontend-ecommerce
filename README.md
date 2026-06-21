# Jongnham E-Commerce — Admin Panel

Admin dashboard for the Jongnham e-commerce platform. Built with Next.js, React 19, and Tailwind CSS.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Axios** — HTTP client for backend API calls
- **js-cookie / jwt-decode** — Auth token management
- **ApexCharts** — Data visualization

## Features

- **Dashboard** — E-commerce overview with charts and metrics
- **User Management** — View and manage admin users
- **Product Management** — Products, categories, options, option values
- **Asset Management** — File/image upload with bulk upload support
- **Banner Management** — Create and manage banners
- **Store Settings** — Update store logo, name, contact info
- **Role-Based Access Control** — Roles and permissions management
- **Authentication** — JWT-based login/logout with protected routes
- **Responsive Sidebar** — Collapsible with permission-based menu filtering

## Getting Started

### Prerequisites

- Node.js 18.x or later (recommended 20.x+)
- Backend API running (see `backend-ecommerce/`)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:3000` by default.

### Environment

Make sure the backend API proxy is configured. API calls are proxied via Next.js rewrites — check `next.config.ts` for backend URL configuration.

## Project Structure

```
src/
├── app/(admin)/          # Admin layout and pages
│   ├── layout.tsx        # Admin layout (sidebar + header + content)
│   └── (others-pages)/   # Feature page modules
│       ├── users/
│       ├── (product)/    # product, category, option, asset
│       ├── banner/
│       ├── role/
│       └── store/
├── components/           # Shared UI components
├── context/              # React contexts (User, Sidebar, Theme, StoreLogo)
├── hooks/                # Custom hooks
├── icons/                # SVG icon components
├── layout/               # AppShell, Sidebar, Header
├── service/              # API service modules (Axios)
└── type/                 # TypeScript interfaces
```

## Related

- **Backend**: `backend-ecommerce/` — Spring Boot REST API
- **Customer Storefront**: `Customer-Facing/` — Next.js customer-facing store
