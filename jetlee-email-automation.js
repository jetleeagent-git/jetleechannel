/**
 * Jetlee Property — Automated Email Campaign
 * 
 * HOW TO SETUP (5 mins, completely free):
 * 1. Go to sheets.new → create a Google Sheet
 * 2. Name tab 1 as "Contacts" — paste your VerticalResponse export in Column A
 * 3. Name tab 2 as "Log" (stays empty, auto-fills)
 * 4. Go to Extensions → Apps Script → paste this entire file
 * 5. Click Save → Run → Authorize → Done
 * 
 * USAGE:
 * - Send to ALL: run sendCampaign()
 * - Send to ROW: run sendSingleEmail(rowNumber)
 * - Preview only: run previewCampaign()
 */

// ===== YOU EDIT THIS SECTION =====

const CAMPAIGN = {
  subject: "🏙 New Launches Alert – June/July Preview",

  // HTML body — use {{NAME}} and {{EMAIL}} for personalisation
  // Can also reference your CSV columns e.g. {{Column B header}}
  htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">

  <div style="text-align: center; margin-bottom: 8px;">
    <p style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0;">
      🏙 New Launches Alert
    </p>
    <p style="font-size: 16px; color: #666; margin: 4px 0 0;">
      Drop me a msg for floor plans & pricing 👇
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e0e0ea; margin: 20px 0;">

  <div style="margin: 20px 0;">
    <p style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px;">
      🌿 Lentor Gardens
    </p>
    <p style="font-size: 14px; color: #555; margin: 0;">
      Preview: <strong>4 Jul</strong> | Lentor MRT, lush living, strong rental demand<br>
      💰 From $2,050 psf | Avg $2,350 psf<br>
      🏆 Most condos in Lentor cluster <strong>already SOLD OUT</strong>
    </p>
    <p style="margin: 8px 0 0;">
      <a href="https://lentorgardens.jetleechannel.sg" style="background: #4f6ef7; color: #fff; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">View Details →</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e0e0ea; margin: 20px 0;">

  <div style="margin: 20px 0;">
    <p style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px;">
      🏛 Dunearn House
    </p>
    <p style="font-size: 14px; color: #555; margin: 0;">
      Preview: <strong>~10 Jul</strong> | Prime D11, 99-yr leasehold by Frasers<br>
      📍 5 mins walk to 6th Avenue MRT (DTL)<br>
      🏗 Ride the massive Turf City transformation!
    </p>
    <p style="margin: 8px 0 0;">
      <a href="https://dunearnhouse.jetleechannel.sg" style="background: #4f6ef7; color: #fff; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">View Details →</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e0e0ea; margin: 20px 0;">

  <div style="margin: 20px 0;">
    <p style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px;">
      🌲 Thomson Reserve
    </p>
    <p style="font-size: 14px; color: #555; margin: 0;">
      Preview: <strong>Sep</strong> | Mega launch ~1,240 units<br>
      🚇 Doorstep to Upper Thomson MRT (TEL)<br>
      🤝 UOL + CapitaLand + SingLand
    </p>
    <p style="margin: 8px 0 0;">
      <a href="https://thomsonreserve.jetleechannel.sg" style="background: #4f6ef7; color: #fff; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">View Details →</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e0e0ea; margin: 20px 0;">

  <div style="margin: 20px 0;">
    <p style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px;">
      🌊 Lucerne Grand
    </p>
    <p style="font-size: 14px; color: #555; margin: 0;">
      Preview: <strong>Mid-Sep</strong> | SG's 1st mixed development @ Lakeside MRT<br>
      🏗 By City Developments Limited (CDL)
    </p>
    <p style="margin: 8px 0 0;">
      <a href="https://lucernegrand.jetleechannel.sg" style="background: #4f6ef7; color: #fff; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">View Details →</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #e0e0ea; margin: 20px 0;">

  <div style="text-align: center; margin-top: 20px;">
    <p style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0;">
      📱 Jet Lee
    </p>
    <p style="font-size: 14px; color: #666; margin: 4px 0;">
      <a href="https://wa.me/6587649315" style="color: #4f6ef7; text-decoration: none;">+65 8764 9315</a>
    </p>
    <p style="font-size: 13px; color: #888; margin: 4px 0;">
      <a href="https://jetlee413.com" style="color: #4f6ef7; text-decoration: none;">jetlee413.com</a>
    </p>
    <p style="font-size: 11px; color: #aaa; margin-top: 16px;">
      If you'd like to stop receiving updates, reply "unsubscribe".
    </p>
  </div>

</div>`
};

// Plain text fallback (for email clients that don't support HTML)
const PLAIN_TEXT = [
  "NEW LAUNCHES ALERT – June/July Preview",
  "",
  "Drop me a msg for floor plans & pricing",
  "",
  "---",
  "",
  "LENTOR GARDENS – 4 Jul",
  "Lentor MRT, lush living, strong rental demand",
  "From $2,050 psf | Avg $2,350 psf",
  "https://lentorgardens.jetleechannel.sg",
  "",
  "---",
  "",
  "DUNEARN HOUSE – ~10 Jul",
  "Prime D11, 99-yr by Frasers",
  "5 mins walk to 6th Avenue MRT (DTL)",
  "https://dunearnhouse.jetleechannel.sg",
  "",
  "---",
  "",
  "THOMSON RESERVE – Sep",
  "Mega launch, Upper Thomson MRT",
  "https://thomsonreserve.jetleechannel.sg",
  "",
  "---",
  "",
  "LUCERNE GRAND – Mid-Sep",
  "SG's 1st mixed dev @ Lakeside MRT",
  "https://lucernegrand.jetleechannel.sg",
  "",
  "---",
  "",
  "Jet Lee | +65 8764 9315",
  "https://jetlee413.com"
].join('\n');

// ===== DO NOT EDIT BELOW UNLESS YOU KNOW WHAT YOU'RE DOING =====

const SHEET_NAME_CONTACTS = "Contacts";
const SHEET_NAME_LOG = "Log";
const SENDER_NAME = "Jet Lee";
const DAILY_LIMIT = 400; // Gmail safe limit (500 max for free, buffer 100)
const BATCH_SIZE = 50;

function getContactsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_CONTACTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_CONTACTS);
    sheet.appendRow(["Email", "Name", "Status", "Date Added"]);
  }
  return sheet;
}

function getLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_LOG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_LOG);
    sheet.appendRow(["Row", "Email", "Name", "Sent At", "Status"]);
  }
  return sheet;
}

function getContacts() {
  const sheet = getContactsSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log("No contacts found (need header + at least 1 row)");
    return [];
  }
  
  const header = data[0].map(h => String(h).toLowerCase().trim());
  const emailCol = header.findIndex(h => h.includes('email'));
  const nameCol = header.findIndex(h => h.includes('name'));
  
  if (emailCol === -1) {
    throw new Error("Could not find an 'Email' column in your Contacts sheet. Please make sure the header contains 'Email'.");
  }
  
  const contacts = [];
  for (let i = 1; i < data.length; i++) {
    const email = String(data[i][emailCol]).trim();
    if (email && email.includes('@')) {
      contacts.push({
        row: i + 1,
        email: email,
        name: nameCol >= 0 ? String(data[i][nameCol]).trim() : '',
        data: data[i],
        header: data[0]
      });
    }
  }
  return contacts;
}

function getSentEmails() {
  const sheet = getLogSheet();
  const data = sheet.getDataRange().getValues();
  const sent = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === "Sent") {
      sent.add(String(data[i][1]).trim().toLowerCase());
    }
  }
  return sent;
}

function personalize(text, contact) {
  let result = text;
  result = result.replace(/{{NAME}}/g, contact.name || contact.email.split('@')[0]);
  result = result.replace(/{{EMAIL}}/g, contact.email);
  // Replace any {{Column Name}} from the CSV
  if (contact.data && contact.header) {
    for (let i = 0; i < contact.header.length; i++) {
      const colName = String(contact.header[i]).trim();
      const val = String(contact.data[i] || '').trim();
      result = result.replace(new RegExp('{{' + colName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '}}', 'g'), val);
    }
  }
  return result;
}

/**
 * Preview who will get the email (safe run, no sending)
 */
function previewCampaign() {
  const contacts = getContacts();
  const sent = getSentEmails();
  const unsent = contacts.filter(c => !sent.has(c.email.toLowerCase()));
  
  Logger.log(`Total contacts: ${contacts.length}`);
  Logger.log(`Already sent: ${sent.size}`);
  Logger.log(`To be sent: ${unsent.length}`);
  
  if (unsent.length > 0) {
    Logger.log("=== First 10 recipients ===");
    for (let i = 0; i < Math.min(10, unsent.length); i++) {
      Logger.log(`  ${unsent[i].email} ${unsent[i].name ? '(' + unsent[i].name + ')' : ''}`);
    }
    if (unsent.length > 10) Logger.log(`  ... and ${unsent.length - 10} more`);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `${unsent.length} emails ready to send (${sent.size} already sent)`,
    "Preview Complete",
    8
  );
}

/**
 * Main function — sends to all unsent contacts in batches
 */
function sendCampaign() {
  const contacts = getContacts();
  const sent = getSentEmails();
  const unsent = contacts.filter(c => !sent.has(c.email.toLowerCase()));
  
  if (unsent.length === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast("All contacts have already received this campaign!", "Done ✅", 5);
    return;
  }
  
  const today = new Date();
  const limit = Math.min(DAILY_LIMIT, unsent.length);
  const batch = unsent.slice(0, limit);
  
  const logSheet = getLogSheet();
  let sentCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batch.length; i++) {
    const contact = batch[i];
    try {
      const personalHtml = personalize(CAMPAIGN.htmlBody, contact);
      const personalText = personalize(PLAIN_TEXT, contact);
      
      GmailApp.sendEmail(contact.email, CAMPAIGN.subject, personalText, {
        htmlBody: personalHtml,
        name: SENDER_NAME
      });
      
      logSheet.appendRow([contact.row, contact.email, contact.name, new Date(), "Sent"]);
      sentCount++;
    } catch (e) {
      logSheet.appendRow([contact.row, contact.email, contact.name, new Date(), "Error: " + e.message]);
      errorCount++;
    }
    
    // Small delay every 20 emails to avoid rate limits
    if (i % 20 === 19) Utilities.sleep(1000);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Sent: ${sentCount} | Errors: ${errorCount} | Today's remaining: ${DAILY_LIMIT - sentCount}`,
    "Campaign Complete",
    10
  );
}

/**
 * Send to a specific row number (useful for testing one email)
 */
function sendSingleEmail(rowNumber) {
  const contacts = getContacts();
  const contact = contacts.find(c => c.row === rowNumber);
  
  if (!contact) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Row ${rowNumber} not found or invalid email`, "Error", 5);
    return;
  }
  
  try {
    const personalHtml = personalize(CAMPAIGN.htmlBody, contact);
    const personalText = personalize(PLAIN_TEXT, contact);
    
    GmailApp.sendEmail(contact.email, "[TEST] " + CAMPAIGN.subject, personalText, {
      htmlBody: personalHtml,
      name: SENDER_NAME
    });
    
    getLogSheet().appendRow([contact.row, contact.email, contact.name, new Date(), "Sent (Test)"]);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Test email sent to ${contact.email}`, "✅", 5);
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${e.message}`, "❌", 5);
  }
}

/**
 * Send to a specific email manually
 */
function sendToEmail(emailAddress) {
  if (!emailAddress || !emailAddress.includes('@')) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Invalid email address", "Error", 5);
    return;
  }
  
  try {
    GmailApp.sendEmail(emailAddress, CAMPAIGN.subject, PLAIN_TEXT, {
      htmlBody: CAMPAIGN.htmlBody,
      name: SENDER_NAME
    });
    
    getLogSheet().appendRow(["Manual", emailAddress, "", new Date(), "Sent"]);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Sent to ${emailAddress}`, "✅", 5);
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${e.message}`, "❌", 5);
  }
}
