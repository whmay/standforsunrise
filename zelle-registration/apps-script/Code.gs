const HEADERS = ['Reference', 'Registered at UTC', 'Contributor name', 'Email', 'Expected amount USD', 'Bank sender name', 'Method', 'Payment status', 'Terms accepted', 'Terms accepted at UTC', 'Terms snapshot SHA256', 'Terms confirmation text', 'Bank transaction ID', 'Actual received USD', 'Received at UTC', 'Reconciled by', 'Notes', 'Phone number'];
const ACCEPTANCE = 'I confirm that I have read and agree to the Contribution Terms. I understand that contributions are NOT tax-deductible and that any return of unused funds is conditional and not guaranteed.';

// Run once in the editor, signed in with the organization's account.
// Private helpers end in _ and cannot be called by public visitors.
function setup_() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) throw new Error('Already configured. Use the existing spreadsheet.');
  const book = SpreadsheetApp.create('Stand for Sunrise — Zelle Registration Ledger');
  const sheet = book.getSheets()[0];
  sheet.setName('Registrations');
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  props.setProperty('SHEET_ID', book.getId());
  props.setProperty('TOKEN_SECRET', Utilities.getUuid() + Utilities.getUuid());
  console.log('Private ledger: ' + book.getUrl());
}

function doGet(e) {
  if (e && e.parameter && e.parameter.page === 'terms') {
    return HtmlService.createHtmlOutputFromFile('Terms').setTitle('Stand for Sunrise — Contribution Terms');
  }
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SHEET_ID') || !props.getProperty('TOKEN_SECRET')) {
    return HtmlService.createHtmlOutput('Registration is not available yet. Please contact contact@standforsunrise.org.');
  }
  const template = HtmlService.createTemplateFromFile('Index');
  const method = e && e.parameter && e.parameter.method ? e.parameter.method : 'zelle';
  if (!['zelle', 'zeffy'].includes(method)) return HtmlService.createHtmlOutput('Please choose Zelle or Zeffy from our contribution page.');
  const nonce = Utilities.getUuid();
  const expires = Date.now() + 2 * 60 * 60 * 1000;
  const signature = sign_(nonce + ':' + expires + ':' + method);
  template.config = JSON.stringify({ nonce, expires, signature, method, termsHash: termsHash_(), termsUrl: ScriptApp.getService().getUrl() + '?page=terms' }).replace(/</g, '\\u003c');
  return template.evaluate().setTitle('Stand for Sunrise — Contribution Registration').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function sign_(text) {
  const secret = PropertiesService.getScriptProperties().getProperty('TOKEN_SECRET');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(text, secret));
}

function termsHash_() {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, HtmlService.createHtmlOutputFromFile('Terms').getContent(), Utilities.Charset.UTF_8).map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}

function cleanText_(value, maximum) {
  if (typeof value !== 'string') throw new Error('Please complete all required fields.');
  const text = value.trim();
  if (!text || text.length > maximum || /[\u0000-\u001f\u007f]/.test(text)) throw new Error('Please check the information entered.');
  return text;
}

function validate_(data) {
  if (!data || data.accepted !== true) throw new Error('Please read and confirm the Contribution Terms.');
  const name = cleanText_(data.name, 120);
  const email = cleanText_(data.email, 254).toLowerCase();
  const phone = cleanText_(data.phone, 40);
  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[0-9 ()-]+$/.test(phone) || digits.length < 7 || digits.length > 15) throw new Error('Please enter a valid phone number, including country code if outside the U.S.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  const amountText = cleanText_(data.amount, 16);
  if (!/^\d+(\.\d{1,2})?$/.test(amountText)) throw new Error('Enter a positive USD amount with no more than two decimal places.');
  const cents = Math.round(Number(amountText) * 100);
  if (!Number.isSafeInteger(cents) || cents < 1 || cents > 100000000) throw new Error('Please check the expected contribution amount.');
  return { name, email, phone, amount: cents / 100 };
}

// Avoid executing user-controlled spreadsheet formulas.
function cell_(text) { return /^[=+\-@]/.test(text) ? "'" + text : text; }

function registerContribution(data) {
  const fields = validate_(data);
  if (!['zelle', 'zeffy'].includes(data.method) || !/^[0-9a-f-]{36}$/.test(data.nonce || '') || !Number.isFinite(data.expires) || data.expires < Date.now() || data.expires > Date.now() + 2 * 60 * 60 * 1000 || data.signature !== sign_(data.nonce + ':' + data.expires + ':' + data.method)) {
    throw new Error('This registration session has expired. Refresh the page and try again.');
  }
  if (data.termsHash !== termsHash_()) throw new Error('The terms have changed. Refresh the page and review them again.');
  const reference = 'SFS-' + data.nonce.replace(/-/g, '').toUpperCase();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Registrations');
    if (!sheet || sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0].join('|') !== HEADERS.join('|')) throw new Error('Ledger configuration error.');
    const existing = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(reference).matchEntireCell(true).findNext() : null;
    if (!existing) {
      const now = new Date().toISOString();
      sheet.appendRow([reference, now, cell_(fields.name), cell_(fields.email), fields.amount, '', data.method === 'zeffy' ? 'Zeffy' : 'Zelle', 'Pending — not verified received', true, now, data.termsHash, ACCEPTANCE, '', '', '', '', '', cell_(fields.phone)]);
      SpreadsheetApp.flush();
    }
    return { reference, saved: true, method: data.method };
  } catch (error) {
    // Never return sheet identifiers, donor rows, or internal errors publicly.
    throw new Error('We could not confirm your registration. Please retry on this page, or contact contact@standforsunrise.org.');
  } finally { lock.releaseLock(); }
}
