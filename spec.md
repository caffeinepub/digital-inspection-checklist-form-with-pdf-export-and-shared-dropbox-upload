# Specification

## Summary
**Goal:** Add three new inspection checklist items to the Home Inspector Checklist application.

**Planned changes:**
- Add a YesNoField item "Is the washer drain properly secured in the drain pipe?" to the plumbing/laundry section
- Add a YesNoField item "If there are any gas burning appliances, test for Carbon Monoxide." to the safety/appliances section
- Add a text input field item "When turning the water on, how long does it take for the hot water to arrive?" to the plumbing/water heater section
- Update types.ts, defaults.ts, and generateChecklistPdf.ts to include all three new fields

**User-visible outcome:** Inspectors will see the three new questions in their respective checklist sections and the answers will appear in the generated PDF report.
