# Code Vita frontend

## Run locally

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env`. Change `VITE_API_BASE_URL` if the API is not at `http://localhost:3000`.
3. Start the development server with `npm run dev`.

The frontend connects to the Express API for account sessions, problem data, submissions, and the account-backed reflection journal. Existing browser-only journal entries are imported into the first signed-in account that opens the journal. The journal can be exported or restored from its JSON backup.

The Progress page turns that account's submission and reflection history into a six-week activity view, retry topic signals, due review count, and recent attempts.

Use **Blind retry** on a linked reflection to reopen the problem with its earlier attempt history hidden. The history appears after the learner submits a fresh solution.

After any completed judge run, learners can capture a reflection. Accepted runs prompt for the idea that worked; failed runs prompt for the approach and blocker. The journal labels and filters breakthroughs separately from retry notes.

The Progress page recommends a next session from due journal entries and repeated struggle topics, with a curated problem fallback when there is nothing to review.

See [the backend setup guide](../backend/README.md) for local services and the starter problem catalog.
