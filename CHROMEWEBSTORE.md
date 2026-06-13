# Chrome Web Store Listing — Squint Extension

> Last Updated: 2026-06-13

## Store Listing

**Extension Name**
Squint Extension

**Short Description**
Run brutally honest 5-second audits by AI personas on any landing page directly from your browser toolbar.

**Detailed Description**
Stop guessing and get Squinted! The Squint Extension lets you perform a brutally honest 5-second design and copy audit of any website you are currently browsing. Inspired by busy founders, skeptical engineers, business buyers, and accessibility experts, our AI critics give you immediate feedback and actionable copy-ready suggestions.

Key Features:
- Visual feedback on the active website.
- Head-to-head competitor comparisons.
- Four distinct personas to critique your site's copy, layout, trust, and call-to-action elements.
- Clean visual scorecard metrics and lighthouse speed integration.

How to use it:
1. Navigate to the landing page you want to audit.
2. Click the Squint extension icon in your toolbar.
3. Select your critic persona.
4. Click "Squint Audit".
5. A new tab will open with your complete scorecard and improvement suggestions!

**Category**
Developer Tools

**Single Purpose**
Triggers a design and copy audit of the active website page.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ⬜ Not created | (Uses default Chrome extension icon) |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile | 440×280 | ⬜ Not created | |

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `activeTab` | permissions | Temporarily grants access to the current tab to retrieve the page URL for auditing. |
| `scripting` | permissions | Used to programmatically execute script fragments on the page to parse basic metadata. |
| `tabs` | permissions | Used to query active tab details and create new tabs to show audit reports. |
| `http://localhost:3000/*` | host_permissions | Allows sending the screenshot and page audit requests to the local Squint server. |
| `<all_urls>` | host_permissions | Allows capture of screenshots on target landing pages. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Website content | Yes | Yes | Sending the active page screenshot and URL to Squint for analysis. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
https://github.com/naufaldirfq/squint/blob/main/PRIVACY.md

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**
Squint Team

**Contact Email**
support@squint.dev

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-13 | Initial skeleton release with popup capturing active tab screenshots and DOM metadata. | Draft |
