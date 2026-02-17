# Specification

## Summary
**Goal:** Update the Safety Inspection checklist form and PDF output to include two additional inspection items: a main shut-off valve exercise checkbox and a toilet tank cracks/leaks check.

**Planned changes:**
- Add a new boolean checklist field labeled exactly “Main Shut Off Valve Exercised”, initialize it to `false`, render it as a checkbox in the appropriate main shut-off valve area, and include it in the generated PDF with an [X]/[ ] marker.
- Add a new Toilet section checklist item labeled exactly “Toilet tank is free of cracks/leaks”, store it using the existing yes/no/empty value pattern, initialize it to an empty string, render it with the existing Yes/No field UI, and include it in the generated PDF printing yes/no or N/A when unset.

**User-visible outcome:** Users can select “Main Shut Off Valve Exercised” and answer whether the toilet tank is free of cracks/leaks in the checklist form, and both selections will appear on the generated PDF.
