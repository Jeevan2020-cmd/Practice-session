/**
 * Lead router for the roofing quote website.
 *
 * What it does, each time someone submits the quote form:
 *   1. Checks the submission isn't spam.
 *   2. Scores the lead (Hot / Warm / Cool) so you can see the best ones first.
 *   3. Adds a row to the "Leads" tab of this Google Sheet: your dated record of every lead.
 *   4. Emails you the lead, ready to forward to the roofer.
 *   5. Optionally sends the customer a short "we've got your enquiry" email.
 *
 * Setup steps are in README.md, step 2. You only need to edit the SETTINGS block.
 */

// ---- SETTINGS: edit these ----
const SETTINGS = {
  // Where new leads are emailed. Separate several addresses with commas.
  LEAD_EMAIL: 'PASTE_YOUR_EMAIL_HERE',
  BRAND_NAME: 'Birmingham Roof Quotes',
  BRAND_PHONE: '07951 702832',
  SITE_URL: 'https://birminghamroofquotes.co.uk',
  // Send the customer a confirmation email (only if they gave an email address).
  SEND_CUSTOMER_CONFIRMATION: true,
  SHEET_NAME: 'Leads',
};
// ---- end of settings ----

const COLUMNS = [
  'Received', 'Rating', 'Score', 'Job', 'Urgency', 'Property', 'Owner', 'Postcode', 'In area',
  'Name', 'Phone', 'Email', 'Best time', 'Details', 'Page', 'Referrer', 'Status', 'Sent to roofer', 'Notes',
];

const LABELS = {
  job: {
    'repair': 'Roof repair or leak', 'new-roof': 'New roof or replacement', 'flat-roof': 'Flat roof',
    'roofline': 'Guttering, fascias or soffits', 'chimney': 'Chimney or lead flashing', 'not-sure': 'Not sure yet',
  },
  urgency: {
    'emergency': 'EMERGENCY: leaking now', '2-weeks': 'Within 2 weeks', '1-3-months': 'Within 1-3 months', 'planning': 'Just getting prices',
  },
  owner: { 'homeowner': 'Homeowner', 'landlord': 'Landlord', 'tenant': 'Tenant', 'business': 'Business property' },
};

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Spam checks. We return "ok" either way so bots learn nothing.
    if (isSpam(p)) return json({ ok: true });

    const lead = clean(p);
    const scored = scoreLead(lead);
    saveToSheet(lead, scored);
    emailLead(lead, scored);
    if (SETTINGS.SEND_CUSTOMER_CONFIRMATION && lead.email) emailCustomer(lead);

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false });
  }
}

// Lets you open the web app URL in a browser to check it's live.
function doGet() {
  return json({ ok: true, message: 'Lead router is running.' });
}

function isSpam(p) {
  if (p.website) return true; // hidden honeypot field was filled in
  const started = Number(p.started_at);
  if (started && Date.now() - started < 4000) return true; // filled in faster than a human could
  if (!p.phone || !p.postcode || !p.name) return true;
  if (/https?:\/\//i.test((p.name || '') + (p.phone || ''))) return true;
  return false;
}

function clean(p) {
  const s = (v, max) => String(v || '').trim().slice(0, max || 200);
  // Stops spreadsheet formulas being injected through form fields.
  const safe = (v, max) => s(v, max).replace(/^[=+\-@]/, "'$&");
  return {
    job: s(p.job, 30), urgency: s(p.urgency, 30), property: safe(p.property, 40), owner: s(p.owner, 30),
    postcode: safe(p.postcode, 10).toUpperCase(), name: safe(p.name, 80), phone: safe(p.phone, 20),
    email: safe(p.email, 120), callTime: safe(p.call_time, 20), details: safe(p.details, 1000),
    page: safe(p.page, 300), referrer: safe(p.referrer, 300),
  };
}

function inArea(postcode) {
  // Outward code is everything except the last 3 characters, e.g. "B73" from "B735AA".
  const compact = postcode.replace(/\s+/g, '').toUpperCase();
  const m = compact.slice(0, -3).match(/^B(\d{1,2})$/);
  if (!m) return false;
  const n = Number(m[1]);
  return (n >= 1 && n <= 48) || (n >= 72 && n <= 76);
}

// A simple, transparent score out of 10. Adjust the numbers to suit your roofer.
function scoreLead(l) {
  let score = 0;
  score += { 'new-roof': 3, 'flat-roof': 2, 'repair': 2, 'chimney': 2, 'roofline': 1, 'not-sure': 1 }[l.job] || 0;
  score += { 'emergency': 3, '2-weeks': 3, '1-3-months': 2, 'planning': 0 }[l.urgency] || 0;
  score += { 'homeowner': 2, 'landlord': 2, 'business': 2, 'tenant': 0 }[l.owner] || 0;
  const local = inArea(l.postcode);
  if (local) score += 2;
  const rating = score >= 8 ? 'HOT' : score >= 6 ? 'WARM' : 'COOL';
  return { score: score, rating: rating, inArea: local };
}

function saveToSheet(l, sc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS.SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  sheet.appendRow([
    new Date(), sc.rating, sc.score, LABELS.job[l.job] || l.job, LABELS.urgency[l.urgency] || l.urgency,
    l.property, LABELS.owner[l.owner] || l.owner, l.postcode, sc.inArea ? 'Yes' : 'NO - check',
    l.name, l.phone, l.email, l.callTime, l.details, l.page, l.referrer, 'New', '', '',
  ]);
}

function emailLead(l, sc) {
  const job = LABELS.job[l.job] || l.job;
  const subject = `[${sc.rating}] ${job} - ${l.postcode} - ${l.name}`;
  const rows = [
    ['Rating', `${sc.rating} (${sc.score}/10)`],
    ['Job', job],
    ['Urgency', LABELS.urgency[l.urgency] || l.urgency],
    ['Property', l.property],
    ['Owner', LABELS.owner[l.owner] || l.owner],
    ['Postcode', `${l.postcode}${sc.inArea ? '' : '  (outside main area - check before sending)'}`],
    ['Name', l.name],
    ['Phone', l.phone],
    ['Email', l.email || '(not given)'],
    ['Best time to call', l.callTime],
    ['Details', l.details || '(none)'],
    ['Came from', l.page],
  ];
  const html =
    `<p>New quote request from the website. The customer agreed to their details being shared with one local roofer.</p>` +
    `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">` +
    rows.map((r) => `<tr><td style="border-bottom:1px solid #ddd;font-weight:bold;vertical-align:top">${esc(r[0])}</td>` +
      `<td style="border-bottom:1px solid #ddd">${esc(r[1]).replace(/\n/g, '<br>')}</td></tr>`).join('') +
    `</table><p style="color:#666;font-size:12px">Also logged in your Google Sheet. Forward this email to the roofer, then mark it as sent in the sheet.</p>`;
  const text = rows.map((r) => `${r[0]}: ${r[1]}`).join('\n');
  MailApp.sendEmail({ to: SETTINGS.LEAD_EMAIL, subject: subject, body: text, htmlBody: html, replyTo: l.email || undefined });
}

function emailCustomer(l) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)) return;
  const first = l.name.split(' ')[0];
  const body =
    `Hi ${first},\n\n` +
    `Thanks for your roofing enquiry. We've received it and we're passing it to a local roofer, ` +
    `who will contact you to arrange a quote. That's usually the same working day.\n\n` +
    `If your roof is leaking right now, here's what to do while you wait:\n` +
    `${SETTINGS.SITE_URL}/guides/roof-leaking-what-to-do/\n\n` +
    `Any questions, call or text us on ${SETTINGS.BRAND_PHONE}.\n\n` +
    `${SETTINGS.BRAND_NAME}`;
  MailApp.sendEmail({ to: l.email, subject: `We've got your roofing enquiry - ${SETTINGS.BRAND_NAME}`, body: body, name: SETTINGS.BRAND_NAME });
}

function esc(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the Apps Script editor to check emails and the sheet work.
function testLead() {
  const fake = { parameter: {
    job: 'new-roof', urgency: '2-weeks', property: 'Semi-detached', owner: 'homeowner', postcode: 'B73 5AA',
    name: 'Test Lead', phone: '07700 900123', email: '', call_time: 'Any time', details: 'This is a test.',
    page: 'test', referrer: '', started_at: String(Date.now() - 60000),
  } };
  doPost(fake);
}
