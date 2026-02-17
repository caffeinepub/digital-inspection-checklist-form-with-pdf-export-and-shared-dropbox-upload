# Specification

## Summary
**Goal:** Fix initial app load reliability across major browsers, add an in-app admin-claim flow, and make Dropbox token storage/uploads reliable with clear user-facing error states.

**Planned changes:**
- Eliminate runtime errors during initial render (router mount, auth initialization, React Query actor creation) so the app consistently renders the main layout and Checklist page, or a readable error screen.
- Add a Header call-to-action for logged-in non-admin users to initiate an admin access flow; prompt unauthenticated users to log in before attempting admin access.
- Implement a backend method to grant/claim admin access under a controlled rule and persist the resulting role assignment so admin status survives across sessions.
- Make Dropbox upload behavior robust: correctly retrieve/use the configured token, avoid any “must be called from component context” call path, and present actionable messages for missing token vs Dropbox API failure.
- Ensure Admin Settings works end-to-end: admins can save a Dropbox token to backend state and later see it is configured; non-admins are denied with the existing access-denied screen; token remains masked in the UI by default.

**User-visible outcome:** Opening the app in Chrome/Firefox/Safari shows the Header + Checklist without a blank screen; users can claim admin access via an in-app button (when eligible) to access /admin and save a Dropbox token; checklist submission either uploads to Dropbox with clear success/failure messaging or clearly reports that Dropbox is not configured while still downloading the PDF.
