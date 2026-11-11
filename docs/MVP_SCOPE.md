# Code Vita launch scope

Target launch: November 18, 2026.

## First release

- A learner can register, sign in, and keep an authenticated session.
- A learner can browse and open a focused set of 10–15 curated DSA problems.
- A learner can run examples, submit a solution to the judge, and see a saved result.
- A learner can record why an attempt failed and revisit the problem later without hints.

The product's learning loop is mistake memory: a failed attempt informs what the learner reviews next. The existing reflection journal is the starting point for that experience.

## Defer until after launch

- Contests, leaderboards, and discussion pages.
- Social sign-in and password recovery.
- Claims of thousands of available problems or AI coaching unless those capabilities are implemented and verified.

## Deployment contract

The API must listen on `0.0.0.0` using the platform-provided `PORT`. Database, session, and judge credentials belong in runtime environment variables. The frontend and API deployment provider/domain are still to be selected; keep the application configuration provider-neutral until then.
