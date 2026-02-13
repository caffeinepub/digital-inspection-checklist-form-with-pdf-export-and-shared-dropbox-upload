# Specification

## Summary
**Goal:** Fix the infinite initial "Loading..." screen so the app reliably renders on desktop and mobile while keeping authentication initialization non-blocking and user-informative.

**Planned changes:**
- Remove any nested React Query provider usage so the app runs under a single `QueryClientProvider` instance (the one already wrapping the app in `frontend/src/main.tsx`) and ensure all React Query hooks/components use that provider.
- Add a fail-safe timeout for Internet Identity initialization: if it stays in an initializing state too long, stop blocking the UI, render the main app anonymously, and show a clear, dismissible warning banner about delayed sign-in initialization.
- Add a non-blocking authentication error path: if Internet Identity initialization/login errors occur, render the app (no full-page loader) and display a visible English error message with a "Reload" action.

**User-visible outcome:** The app no longer gets stuck on "Loading..." and will render the Checklist and navigation reliably; if sign-in is slow or fails, users can still use the app anonymously while seeing a clear warning/error message (with a reload option), and auth state updates if initialization later succeeds.
