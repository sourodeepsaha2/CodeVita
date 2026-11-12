# Code Vita frontend

## Run locally

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env`. Change `VITE_API_BASE_URL` if the API is not at `http://localhost:3000`.
3. Start the development server with `npm run dev`.

The frontend connects to the Express API for account sessions, problem data, and submissions. Reflection notes are stored in this browser and can be exported from the journal page.

See [the backend setup guide](../backend/README.md) for local services and the starter problem catalog.
