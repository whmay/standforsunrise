# Contribution registration — Zeffy and Zelle

The organization-owned Google Apps Script web app saves contributor name, email, phone, expected amount, channel, server timestamp, reference, agreement confirmation text and agreement snapshot hash to a private Google Sheet. Payment instructions appear only after the record is saved. Public visitors can register; the ledger remains private.

The production Contribute page links to the app with `?method=zeffy` or `?method=zelle`. Zeffy then offers the supplied hosted checkout link; Zelle shows the organization QR and tag. The shared Contribute landing page retains its two disclosures and does not require a duplicate checkbox. Registration does not prove payment, verify email ownership, or establish return eligibility. Reconcile actual transactions separately.

## Source and updates

- `apps-script/Code.gs`: validation, channel-bound session signatures, duplicate submission protection and private sheet writes.
- `apps-script/Index.html`: branded registration page with required terms confirmation and phone collection.
- `apps-script/Terms.html`: immutable-per-deployment reading copy of the website terms; its SHA256 is stored on each acceptance. Preserve old source/deployments when updating terms.
- `tests/registration.test.cjs`: local contract tests using mocks. Run with `node zelle-registration/tests/registration.test.cjs` from the repository root.

Edit and deploy using the organization Google account. A source push alone does not update Google Apps Script. In the existing Apps Script project, save the changed files, then Deploy > Manage deployments > Edit > New version. The live registration deployment uses Execute as the organization account and Who has access Anyone. Keep the backing spreadsheet restricted; never publish it or commit records, its identifier, or script secrets here.

## Ledger schema and reconciliation

Columns A–R are Reference, Registered at UTC, Contributor name, Email, Expected amount USD, Bank sender name (historical), Method, Payment status, Terms accepted, Terms accepted at UTC, Terms snapshot SHA256, Terms confirmation text, Bank transaction ID, Actual received USD, Received at UTC, Reconciled by, Notes, Phone number. New records leave the historical sender-name column blank. Existing entries were preserved when the Phone number column was added.

All registrations start Pending — not verified received. Match bank/Zeffy records by contributor name, email, reference and amount. Fill the bank or processor transaction ID, actual amount, date and reviewer before marking received. A Zeffy link click is not a successful payment, and no automatic payment synchronization is configured. Synthetic QA rows are marked TEST/no payment and must be excluded from totals. Determine organizational acceptance, insider status and any return eligibility separately under the adopted terms.

## Initial setup for a replacement project only

Create an organization-owned Apps Script project and copy Code.gs, Index.html, Terms.html and the manifest. Temporarily add `function initializeLedger() { setup_(); }`, run it once with authorization, then remove the public wrapper before deployment. The setup creates a private spreadsheet and stores its ID and session secret in Script Properties. Do not rerun setup on the existing production project. Google deployment reference: https://developers.google.com/apps-script/guides/web

## Validation

Private browser QA verified required acceptance, successful pending record creation, matching reference, acceptance timestamp and 64-character hash, valid phone storage, archived terms access, and method-specific instructions. Local tests cover invalid inputs, duplicate retries, channel tampering, formula escaping and failed writes. Public deployment was checked without credentials before switching the production landing page. No actual money was transferred during QA.
