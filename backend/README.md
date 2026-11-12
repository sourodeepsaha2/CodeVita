# Code Vita API

## Local setup

1. Copy `.env.example` to `.env` and fill in MongoDB, Redis, JWT, and Judge0 settings.
2. Install dependencies with `npm install`.
3. Run `npm start` to start the API on port 3000.

The frontend expects the API at `http://localhost:3000` unless `VITE_API_BASE_URL` is set in `frontend/.env`.

## Seed the MVP practice set

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and optionally `ADMIN_NAME` in the backend environment, then run `npm run seed` from this directory. The script creates that admin account if needed and installs or updates the 10 starter problems. If the email already belongs to a non-admin account, the seed command promotes it and replaces its password with `ADMIN_PASSWORD`; use an address reserved for administration.

The seed script does not need Redis or Judge0 credentials. Code execution requires `RAPIDAPI_KEY` at runtime.
