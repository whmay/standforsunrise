# Zelle registration pilot — not connected to production

This branch contains a Google Apps Script app that saves registrations in a private organization-owned Google Sheet. After a confirmed sheet write, it displays a server-issued reference and the existing Zelle QR code/tag. It does not collect money, verify a bank transfer, promise a return, or email anyone automatically.

## Deploy with the organization's Google Workspace account

1. Sign in as the organization at https://script.google.com/ and create a project named `Stand for Sunrise Zelle Registration`.
2. Replace `Code.gs` with `apps-script/Code.gs`. Add HTML files named `Index` and `Terms`, copying the matching files in this directory. `Terms.html` is an archived copy of the reviewed website terms; the form links to this copy and stores its SHA256, so a later website edit does not change the accepted text.
3. In Project Settings enable “Show appsscript.json manifest file” and replace it with `apps-script/appsscript.json`.
4. Private functions ending in `_` do not appear in the editor function selector. Temporarily add `function initializeLedger() { setup_(); }` at the end of Code.gs, select `initializeLedger`, run it, and authorize the organization account. Remove this public wrapper and save again before deployment. This creates a new private spreadsheet. Its URL is in the execution log. Do not publish the sheet or give link-based access. Share only with authorized recordkeepers.
5. Deploy > New deployment > Web app. Execute as the organization account; access must allow intended external contributors (normally Anyone). Workspace administrator policy may restrict this. Keep the spreadsheet private even though the registration web app is public. Google deployment reference: https://developers.google.com/apps-script/guides/web
6. Send the resulting `/exec` URL back for website integration. Do not substitute the `/dev` test URL.

## Pilot check before changing the live Zelle entry

- Use made-up name/email, $0.01 expected amount; check terms and submit. Confirm exactly one `Pending — not verified received` row appears and the displayed reference matches it. No payment is necessary to test registration.
- Unchecked acceptance or invalid/zero amounts must not submit. An expired page requires refresh.
- Retry the same submission: no duplicate ledger row. A fresh page creates a fresh reference for a separate intended contribution.
- Try a name starting with `=`: the ledger must treat it as text, never a formula.
- Verify an ordinary external visitor can access the app without sheet access. Test a failed sheet write: no QR should be revealed as saved.
- Verify the archived terms display correctly, including relevant placeholders and disclosures. This pilot does not resolve or change the agreement's substantive content or adoption status.
- The script has no public list/search endpoint for contributor records. It does not verify email ownership or include CAPTCHA/advanced abuse prevention. Monitor script quotas and erroneous entries during the pilot; do not treat a registration as a verified contributor or payment.

## Reconciliation

Match reference, bank sender name, amount and date to the actual bank transaction. Fill the Bank transaction ID, Actual received USD, Received at UTC and Reconciled by columns, then change status to `Received — verified`. Pending registrations are not received contributions. Multiple submissions with different references require review for duplicates. Do not calculate return eligibility solely from this sheet: insider status, organizational acceptance and the agreement's other conditions still need review.

For corrections preserve the original registration and note the change. Back up the ledger regularly, preserve deployed source/terms snapshots, and archive reconciliation evidence privately. Never commit live records to GitHub. Updating Terms requires a new deployment, and old terms must be retained with the corresponding source commit/hash.

## Files

- `apps-script/`: deployable app; no personal records or secrets are included.
- `preview.html`: isolated frontend demo. It sends and saves nothing. It is deliberately labeled TEST PREVIEW and must not replace the actual collection app.
- `tests/`: local validation/persistence contract checks using mocks, not a live Google deployment test.

Production `contribute.html` is intentionally unchanged until the organization-owned app has been deployed and tested. Integration will replace the inline Zelle details with a link to the `/exec` app; the app will still independently require acceptance.

## Private pilot verified — November 21, 2026

The organization-owned app was deployed with access restricted to the owner. Live browser checks confirmed that unchecked terms block submission, a synthetic registration creates a pending row with the matching server reference, acceptance timestamp and 64-character terms hash, and the QR is shown only after a successful save. The archived terms link was opened successfully. The spreadsheet sharing control confirmed private to the owner. The synthetic row was explicitly marked TEST/no payment and excluded from contribution totals. No money was transferred. The temporary initialization wrapper was removed before deployment. Production website integration and public access remain pending. Private ledger identifiers and registration records are intentionally not stored in this repository.

## Unified registration

The same deployed app now supports `?method=zelle` (default) and `?method=zeffy`. The channel is signed into the session token and recorded in the private ledger. Zeffy registration saves acceptance and expected details before revealing the exact supplied Zeffy checkout link. There is no automatic Zeffy transaction synchronization: match the checkout name/email/amount and reference where available against Zeffy payment exports. A pending registration or checkout-link click never confirms payment. The existing Bank sender name ledger column stores the checkout name for Zeffy; Method distinguishes the interpretation. Private test access remains in place.
