# Specification

## Summary
**Goal:** Provide a two-page digital inspection checklist that matches the uploaded “Courtesy Safety & Health Inspection Checklist” in section order, supports PDF download, and optionally uploads the PDF to a shared Dropbox account configured by an admin.

**Planned changes:**
- Build a two-page, fillable checklist form that recreates all sections and fields from both uploaded images (header fields, checklist items, and page-2 continuation items including Yes/No sub-items where shown).
- Add a required “Room Number” field; prevent submission until it’s provided and use it as the generated PDF filename (“<RoomNumber>.pdf”).
- On submission, generate a simplified, readable PDF containing Room Number, Inspector, Date, Unit/Area, and all checklist responses; immediately download it to the user.
- Add an Admin Settings page to paste/save a Dropbox access token (persisted in backend; not revealed after saving; show success/error feedback).
- On successful submission, if a Dropbox token is configured, upload the generated PDF to the shared Dropbox account and show upload status (uploading/success/failure); if not configured, still allow download and show a clear “not configured” message.
- Enforce basic admin-only access for setting/replacing the Dropbox token (backend authorization and frontend access-denied state).
- Apply a consistent, distinct visual theme across the app suitable for inspections, with clear section separation and no blue/purple primary palette.

**User-visible outcome:** Users can complete the full inspection checklist digitally, enter a Room Number, submit to download a simplified PDF named after the Room Number, and (when configured) have the PDF automatically uploaded to a shared Dropbox; admins can securely configure the Dropbox token in an admin-only settings screen.
