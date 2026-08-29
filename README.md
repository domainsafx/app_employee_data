# Sahayak Partners — Employee & Referral Portal

A Next.js (App Router + TypeScript + Tailwind) app for managing employees, referral-based
subscriptions, and commissions. Data is stored in **MongoDB** — every collection, its indexes,
and initial seed data (demo admin accounts + the three packages) are created automatically the
first time the app connects. There's nothing to set up by hand in MongoDB itself.

## Getting started

1. Have a MongoDB instance ready — either install MongoDB locally, run it in Docker
   (`docker run -d -p 27017:27017 mongo`), or create a free cluster on
   [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI` to your connection string:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000. On the very first request, the app connects to MongoDB and:
   - Creates all 7 collections (`admins`, `employees`, `users`, `packages`, `supportTickets`,
     `activityLog`, `otps`) if they don't already exist.
   - Creates the indexes each collection needs (unique reference IDs, unique mobile numbers,
     unique payment tokens, a TTL index that auto-expires OTP documents, etc.) — see
     `src/lib/mongodb.ts` for the exact list.
   - Seeds the two demo admin accounts and the three packages, only if those collections are
     still empty.

If MongoDB isn't reachable, API calls fail fast (within ~8 seconds) with a clear error message
telling you to check `MONGODB_URI`, rather than hanging.

## Demo logins

| Role | Username | Password |
|---|---|---|
| Super Admin | `superadmin` | `super@123` |
| Admin | `admin` | `admin@123` |

Change these directly in MongoDB (the `admins` collection) once you're using this for real —
passwords are stored in plain text in this prototype and should be hashed (e.g. with bcrypt)
before going to production.

## Employee login (OTP)

1. An admin must first add the employee (Admin → Add employee) with their mobile number.
2. The employee goes to **Employee Login**, enters that mobile number, and requests an OTP.
3. Because no SMS gateway is connected yet, the OTP is shown directly on screen in a
   "Demo mode" banner — wire up a real SMS provider (e.g. Twilio, MSG91) in
   `src/app/api/auth/employee-otp/request/route.ts` to send it for real, and remove the
   `demoOtp` field from the response.

## What's included

- **Admin dashboard** — overview stats, employee list & search, add-employee form (with
  Aadhar/PAN numbers + document photo upload, plus unlimited custom fields), employee detail
  page (documents, active/inactive toggle with a required reason + confirmation popup, users
  referred), support ticket inbox.
- **Super Admin dashboard** — everything Admin has, plus a platform-wide activity log of every
  login, employee change, and subscription.
- **Employee portal** — top navbar with name + permanent reference ID, and a two-tab home:
  - **New user** — a form (name, mobile, email, address, package, billing cycle) with a
    consent checkbox, where the employee also picks how this particular subscription should be
    handled: **Existing customer** (mark active immediately, no link needed), **Send a payment
    link** (a unique link is generated for that user alone to share themselves), or **Notify to
    confirm & pay** (the user is sent a notification asking them to confirm and pay). Submitting
    generates a per-user link at `/pay/[token]` that skips straight to a payment screen.
  - **Existing users** — every user the employee has added, with the subscription type editable
    per row at any time, plus Copy link / Resend / Mark paid actions.
  - Commission auto-upgrades from 10% to 12% after 100 paid referrals.
  - A Support/Help tab that logs tickets for the admin (2–3 working day SLA messaging) plus a
    WhatsApp shortcut.
- **Per-user payment page** (`/pay/[token]`) — reached via an employee-generated link, shows the
  referring employee's name, the plan and amount for that specific user, and a mock payment step
  (UPI / Card / Netbanking) before confirming — no additional form, since the user's details were
  already collected by the employee.

## Data & limits

- All data lives in MongoDB (see "Getting started" above for how collections/indexes/seed data
  get created automatically).
- Employee documents (Aadhar/PAN photos) are saved to `public/uploads/` on disk — move this to
  cloud storage (S3, GCS) before going to production, since local disk storage doesn't survive
  redeploys on most hosts.
- The employee list is capped at 25 (`EMPLOYEE_LIMIT` in `src/lib/repo.ts`) per the current
  brief — raise this constant any time to scale up.
- Reference IDs are permanent, 8-character, alphanumeric (uppercase letters + digits, with
  visually-confusing characters like `0/O` and `1/I` excluded), generated at creation time and
  checked for uniqueness against MongoDB.

## Moving to production

This prototype is intentionally self-contained so it's easy to run and review. Before shipping:

- Hash admin passwords; consider a proper auth provider.
- Connect a real SMS/OTP gateway and a real payment gateway (Razorpay/Stripe/etc.) in place of
  the mock payment step on the `/pay/[token]` page.
- Wire the "Notify to confirm & pay" subscription type up to a real SMS/email/WhatsApp send —
  right now it just timestamps `notifiedAt` to simulate the send.
- Store uploaded documents in secure cloud storage (S3, GCS) rather than the local filesystem.
- Move the 25-employee cap into a configurable plan/setting if it needs to vary per admin.
- Use a production-grade MongoDB deployment (replica set on Atlas or self-hosted) with proper
  backups and access control (a dedicated database user rather than an admin connection string).
