# Pubali Bank — Digital Banking Demo

A modern, fully client-side demo of the Pubali Bank Limited digital banking experience, built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui**.

> Authentication is 100% local (no Supabase, Firebase, or external provider). All data lives in the browser's `localStorage`.

## Demo Accounts

The login page shows these credentials and lets you click to autofill.

| Role     | Email                       | Password     |
| -------- | --------------------------- | ------------ |
| Admin    | `admin@pubalibank.com`      | `admin123`   |
| Customer | `customer@pubalibank.com`   | `customer123`|

Sign-up also works — new users are stored locally with the `customer` role.

## Features

### Authentication
- Email/password sign in & sign up
- Session persistence in `localStorage`
- Protected routes via `_authenticated` layout
- Role-based access (admin-only `/admin` page)
- Logout, password reset (demo), proper loading and error states

### Banking
- **Dashboard** – balance summary, available balance, spending overview, recent activity, quick actions
- **Accounts** – savings, current, salary and fixed-deposit accounts with details
- **Transactions** – searchable / filterable history with export-ready CSV
- **Fund Transfer** – own accounts, beneficiaries, external bank, confirmation & receipt
- **Beneficiaries** – add, remove, send-money shortcut
- **Cards** – debit / credit cards, freeze/unfreeze, limit management
- **Loans** – product catalog, eligibility calculator, application & status tracking
- **Bills & Recharge** – electricity, mobile, internet, TV, gas, water, education
- **Notifications** – transaction, security, alert and promo categories with read/unread
- **Branches** – branch locator with city/division filter
- **Exchange rates** – live-style FX table
- **Security center** – sessions, audit log
- **Support** – ticketing
- **Profile** – personal info, change password, security & notification preferences

### UI / UX
- Pubali Bank branding preserved (colors, gradients, Bangla/English typography)
- Fully responsive (mobile → desktop)
- Skeleton loaders, empty states, toast feedback
- Collapsible sidebar, accessible navigation

## Run locally

```bash
bun install        # or npm install / pnpm install
bun dev            # http://localhost:5173
```

## Build

```bash
bun run build
bun run preview
```

## Project layout

```
src/
  components/
    banking/        # PageContainer, StatCard, TransactionRow, AccountCard
    landing/        # Marketing home sections
    layout/         # AppSidebar, BrandMark, Topbar
    ui/             # shadcn primitives
  lib/
    auth.tsx        # Dummy auth provider (localStorage)
    banking-data.ts # Mock accounts, txs, cards, branches, FX, etc.
    banking-store.ts# Client-side persistence for transfers, cards, loans, tickets
  routes/
    __root.tsx
    index.tsx               # Landing page
    auth.tsx                # Sign in / Sign up (with demo creds card)
    reset-password.tsx
    _authenticated.tsx      # Route guard
    _authenticated/
      dashboard.tsx accounts.tsx transactions.tsx transfer.tsx
      beneficiaries.tsx bills.tsx cards.tsx loans.tsx
      notifications.tsx profile.tsx
      branches.tsx fx.tsx security.tsx support.tsx
      admin.tsx
```
