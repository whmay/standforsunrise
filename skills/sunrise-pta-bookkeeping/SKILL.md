---
name: sunrise-pta-monthly-bookkeeping
description: Review Sunrise PTA monthly WaFd checking and savings activity against MoneyMinder and supporting Givebacks, Stripe, Benevity, Blackbaud and other sources; prepare audit-friendly transaction workbooks and financial reports without guessing.
---

# Sunrise PTA Monthly Bookkeeping

## Purpose
Provide a repeatable workflow for PTA month-end bookkeeping, transaction entry preparation, reconciliation, and financial reporting. Keep checking and savings separate, then provide a consolidated summary. This skill is **instructions only**; do not store month-specific records or personal data in the repository.

Do not claim an account has been reconciled unless the books, statement balances, outstanding items, and supporting documents have been reviewed. Never modify live MoneyMinder entries or bank records without explicit authorization.

## Inputs
Request, as available:
1. Complete monthly WaFd checking and savings statements.
2. MoneyMinder transactions/register and existing reconciliation exports.
3. Givebacks, Stripe payouts/transactions/fees, Benevity, Blackbaud and other platform records relevant to the month.
4. Check images, receipts, Zelle details, deposit documentation, reimbursements, and any necessary budget categories.
5. Previous **approved** monthly workbook and written financial report as layout/category references.

If an input is missing, continue with a provisional review and record exactly what cannot be verified.

## Non-negotiable rules
- **Statement order:** Preserve every posted bank transaction in the order printed on the original statement, with a stable `Bank No.`; do not sort by date or regroup the bank ledger.
- **Yellow = already entered:** In a workbook where yellow denotes transactions already entered in MoneyMinder, do not change those rows' contents, colors, statuses, or formulas unless explicitly instructed. **Red = review:** Focus on red/unresolved items, adding an audit/change log.
- **Evidence:** `Clear` means BOTH the purpose/payee is identified AND adequate documentary support exists. An amount match alone is not sufficient. Mark unresolved items `Unclear` / `Needs documentation`, explaining the reason.
- **Descriptions:** Preserve the exact statement text in one field and write a meaningful purpose in another. Do not replace supported descriptions with generic `Deposit` or `Payment`.
- **No guesses:** Do not invent classifications, names, check purposes, approval, or tax treatment. Carry forward an earlier approved category only where supporting evidence fits.
- **Avoid double counting:** Net Stripe/Givebacks payout summary rows and itemized charges are two views of the same flow. Keep bank payout summary rows for reconciliation, individual charge rows for relevant entry planning, and explicitly reconcile gross, fees, refunds and net.
- **Transfers:** Record both sides of checking/savings transfers; do not count them as consolidated income and expense.
- **Privacy:** Minimize personal information in deliverables; never commit monthly source or output data to GitHub or include full bank account numbers in board-facing reports.
- **Control totals:** Verify bank statement opening balance + credits − debits = closing balance and investigate count/amount mismatches. Never force an adjusting entry to make numbers reconcile.

## Monthly workflow

### 1. Inventory input and coverage
Identify the target month and accounts, which statement pages are provided, MoneyMinder coverage, and the dates/IDs covered by every processor export. List gaps.

### 2. Build the statement-order ledger
For each account, capture posting date, `Bank No.`, signed amount, original description, check/reference number, and account. Validate statement credits/debits, transaction counts, and beginning/ending balances.

### 3. Match MoneyMinder entries
Match by account, amount, date window, check number/reference, and supporting description. Distinguish:
- `Matched`
- `Needs entry`
- `Needs correction`
- `Suspected duplicate`
- `Outstanding / timing difference`
- `Unresolved`

Do not edit yellow/already-entered rows or delete outstanding entries merely because they have not cleared.

### 4. Identify purpose and categorize
Review receipts, checks, reimbursements, donations, and platform sources. Record the supporting file/source and specific purpose; preserve original payee descriptions. Use `Category to confirm` for uncertain items.

### 5. Stripe itemization and reconciliation
When Stripe CSVs are supplied:
1. **Read every CSV**, including newly supplied exports, and inventory file names, payout IDs, source date coverage, and duplicate overlapping rows. Do not declare a payout missing until all supplied files have been checked.
2. Match each bank payout by **net amount**, verifying gross charges minus processor fees, refunds and adjustments; use dates and IDs to resolve timing differences.
3. Beneath each corresponding bank payout (without disturbing statement parent-row ordering), create **one itemized detail row per underlying Stripe transaction**. Retain source file, payout ID, transaction ID, payment/contact name, student name (if supplied), program/category, gross, fee, refund/adjustment, and net.
4. Use the program name explicitly supported by CSV, such as `Band`, `Orchestra/Strings`, `Chess Club`, or `Mandarin`; avoid replacing these with generic `School Activity Fees`.
5. If a MoneyMinder entry screenshot shows category and contact per line, mirror this: **one category and one associated contact per row**. Never invent a missing name or imply payer and student are the same person.
6. Separate summary and itemization views to prevent duplicate entries. Explain how each bank net payout ties to the detail rows.
7. If a payout is still unmatched, specify its amount, date, search coverage and precise unresolved evidence.

### 6. Other processor and deposit checks
For Givebacks, Benevity, Blackbaud and other sources, distinguish transaction-level evidence from bank deposits. Match amount/date/reference, note platform fees and timing, and do not claim a complete match when screenshots omit amounts or key details.

### 7. Reconcile each account
Reconcile bank statement closing balance to MoneyMinder book balance using identified outstanding checks, deposits in transit, timing differences and justified adjustments. List all exceptions. Check transfers across accounts and consolidate without double counting.

### 8. Output
Produce files only when supporting inputs suffice. Label provisional outputs accordingly.

**`YYYY-MM_MoneyMinder_Items_to_Enter.xlsx`**
- Original-order checking and savings bank ledgers
- `Items to Enter` for confirmed missing MoneyMinder entries, in original bank order with `Bank No.`
- Itemized Stripe details with payer/contact, student when available, exact program/category, gross, fees and net
- `Processor Reconciliation` showing payout-to-bank math
- `Exceptions & Questions`, `Change Log` and `Summary`
- Preserve original workbook worksheet names/structure and yellow rows when a user-provided current workbook is being updated. Prefer approved prior-month formats.

**`YYYY-MM_Reconciliation_Summary.pdf`**
- Separate checking and savings reconciliations with balances, posted totals, outstanding items and unexplained differences.
- Mark `FINAL` only after validation; otherwise `DRAFT — ITEMS PENDING`.

**`YYYY-MM_Written_Financial_Report.docx`**
- Board-readable beginning/ending balances, activity totals, notable transactions, and open items.
- Follow the approved report template when given. Never present inferred purposes as established facts.

## Final quality check
- All provided statements/pages and CSVs accounted for, or gaps documented.
- Every bank item appears exactly once in its original order.
- Yellow entered items untouched; red items reviewed with logged changes.
- Transaction purposes and supporting evidence clearly separated.
- Stripe payouts reconciled to transaction-level gross, fees, refunds and net; no double counting.
- Checking/savings balances, outstanding items and transfers reviewed.
- Report/workbook totals agree; unresolved items visible.
- No bank account numbers, personal transaction data, or sensitive source files published to the repository.

## Example trigger
`Run Sunrise PTA bookkeeping for November 2026 using skills/sunrise-pta-bookkeeping/SKILL.md.`

The assistant should consult this skill, process the files uploaded in that working chat, and produce a review package. Keep source data and outputs outside the public GitHub repository.

## Limitations
This is bookkeeping support, not independent financial certification, an audit, tax advice, or approval of transactions.
