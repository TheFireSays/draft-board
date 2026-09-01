/**
 * Draft Sync — Google Apps Script webhook
 * Receives POSTs from the auction draft app and writes the full draft
 * log into a "Draft Log" tab of this spreadsheet.
 *
 * SETUP (one time, ~2 minutes):
 * 1. Open your working copy of the sheet.
 * 2. Extensions → Apps Script. Delete any starter code, paste this file.
 * 3. Click Deploy → New deployment → type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Authorize when prompted, then copy the Web app URL.
 * 5. Paste that URL into the app: Settings → "Sheet sync URL".
 *
 * The app sends the ENTIRE draft state on every pick (not a diff),
 * so the sheet is always a complete snapshot — undo in the app
 * simply results in the next push overwriting the log.
 */

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Draft Log") || ss.insertSheet("Draft Log");

  sh.clearContents();
  sh.getRange(1, 1, 1, 6).setValues([["#", "Player", "Pos", "Team", "Price", "My Team"]]);

  if (data.picks && data.picks.length) {
    var rows = data.picks.map(function (p, i) {
      return [i + 1, p.name, p.pos, p.team, p.price, p.mine ? "YES" : ""];
    });
    sh.getRange(2, 1, rows.length, 6).setValues(rows);
  }

  sh.getRange(1, 8, 3, 2).setValues([
    ["Spent", data.spent || 0],
    ["Remaining", data.remaining || 0],
    ["Updated", data.updated || new Date().toISOString()],
  ]);

  return ContentService.createTextOutput("ok");
}

/** Optional: visit the web app URL in a browser to confirm it's deployed. */
function doGet() {
  return ContentService.createTextOutput("Draft Sync is live. POST draft data here.");
}
