/**
 * The Kult — campaign dashboard backend (Google Apps Script).
 *
 * This file is version-controlled for reference; the deployed copy lives in
 * the Apps Script editor attached to the spreadsheet. After editing here you
 * must paste it back and re-deploy for changes to take effect.
 *
 * NOTE: SECRET_KEY below is a placeholder. Keep the real value only in the
 * deployed script — do not commit it. It must match the password typed into
 * admin.html's lock screen.
 */
const SECRET_KEY = 'REPLACE_WITH_YOUR_KEY';

// Brute-force throttle. Apps Script gives no client IP, so a per-IP limit
// isn't possible and a hard lockout would let an attacker lock the owners
// out. Instead each recent failure adds a delay, which makes a large guessing
// run impractical while barely affecting someone who mistypes once or twice.
const THROTTLE_WINDOW_SECONDS = 900;
const THROTTLE_FREE_ATTEMPTS = 5;
const THROTTLE_STEP_MS = 1500;
const THROTTLE_MAX_MS = 15000;

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function throttleOnFailure_() {
  const cache = CacheService.getScriptCache();
  const fails = parseInt(cache.get('authFails') || '0', 10) + 1;
  cache.put('authFails', String(fails), THROTTLE_WINDOW_SECONDS);
  const over = fails - THROTTLE_FREE_ATTEMPTS;
  if (over > 0) Utilities.sleep(Math.min(over * THROTTLE_STEP_MS, THROTTLE_MAX_MS));
}

function handleRequest(e) {
  const params = e.parameter;

  if (params.key !== SECRET_KEY) {
    throttleOnFailure_();
    return jsonOut({ error: 'Unauthorized' });
  }

  const action = params.action;
  let result;

  try {
    if      (action === 'getAll')             result = getAll();
    else if (action === 'getSongs')           result = getSongs();
    else if (action === 'addSong')            result = addSong(params);
    else if (action === 'deleteSong')         result = deleteSong(params);
    else if (action === 'updateSong')         result = updateSong(params);
    else if (action === 'getPayouts')         result = getPayouts(params);
    else if (action === 'addPayout')          result = addPayout(params);
    else if (action === 'deletePayout')       result = deletePayout(params);
    else if (action === 'updatePayout')       result = updatePayout(params);
    else if (action === 'updatePayoutStatus') result = updatePayoutStatus(params);
    else if (action === 'addExpense')         result = addExpense(params);
    else if (action === 'deleteExpense')      result = deleteExpense(params);
    else if (action === 'addCreator')         result = addCreator(params);
    else if (action === 'updateCreator')      result = updateCreator(params);
    else if (action === 'deleteCreator')      result = deleteCreator(params);
    else result = { error: 'Unknown action' };
  } catch (err) {
    result = { error: err.toString() };
  }

  return jsonOut(result);
}

/**
 * Sheets hands back a real Date for date cells. JSON.stringify would turn
 * that into UTC ("2026-07-04T21:00:00.000Z" for a July 5 entry in a UTC+3
 * sheet), which shifts payouts into the wrong month at month boundaries.
 * Format in the spreadsheet's own timezone so the client gets an unambiguous
 * calendar date.
 */
function toDateString_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(),
      'yyyy-MM-dd'
    );
  }
  return value || '';
}

function getAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const songData    = ss.getSheetByName('Songs').getDataRange().getValues();
  const payoutData  = ss.getSheetByName('Payouts').getDataRange().getValues();
  const expenseData = ss.getSheetByName('Expenses').getDataRange().getValues();
  const creatorData = ss.getSheetByName('Creators').getDataRange().getValues();

  const songs = songData.length <= 1 ? [] : songData.slice(1).map(row => ({
    id: row[0], name: row[1], artist: row[2], budget: row[3],
    date: toDateString_(row[4]), notes: row[5], spendable: row[6], status: row[7],
    month: row[8], year: row[9]
  }));

  const payouts = payoutData.length <= 1 ? [] : payoutData.slice(1).map(row => ({
    id: row[0], songId: row[1], creator: row[2], amount: row[3],
    videos: row[4], date: toDateString_(row[5]), notes: row[6], delivered: row[7], paid: row[8]
  }));

  const expenses = expenseData.length <= 1 ? [] : expenseData.slice(1).map(row => ({
    id: row[0], month: row[1], year: row[2], name: row[3],
    amount: row[4], category: row[5], notes: row[6]
  }));

  const creators = creatorData.length <= 1 ? [] : creatorData.slice(1).map(row => ({
    id: row[0], handle: row[1], niche: row[2], rate: row[3], notes: row[4]
  }));

  return { songs, payouts, expenses, creators };
}

function getSongs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(row => ({
    id: row[0], name: row[1], artist: row[2], budget: row[3],
    date: toDateString_(row[4]), notes: row[5], spendable: row[6], status: row[7],
    month: row[8], year: row[9]
  }));
}

function addSong(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs');
  const id = Utilities.getUuid();
  sheet.appendRow([
    id, params.name, params.artist, params.budget, params.date, params.notes || '',
    params.spendable || '50', params.status || 'active', params.month || '', params.year || ''
  ]);
  return { success: true, id };
}

function deleteSong(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) { sheet.deleteRow(i + 1); break; }
  }
  const payouts = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payouts');
  const pdata = payouts.getDataRange().getValues();
  for (let i = pdata.length - 1; i >= 1; i--) {
    if (pdata[i][1] === params.id) payouts.deleteRow(i + 1);
  }
  return { success: true };
}

function updateSong(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      sheet.getRange(i+1, 2).setValue(params.name);
      sheet.getRange(i+1, 3).setValue(params.artist);
      sheet.getRange(i+1, 4).setValue(params.budget);
      sheet.getRange(i+1, 6).setValue(params.notes || '');
      sheet.getRange(i+1, 7).setValue(params.spendable || '50');
      sheet.getRange(i+1, 8).setValue(params.status || 'active');
      sheet.getRange(i+1, 9).setValue(params.month || '');
      sheet.getRange(i+1, 10).setValue(params.year || '');
      break;
    }
  }
  return { success: true };
}

function getPayouts(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payouts');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1)
    .filter(row => row[1] === params.songId)
    .map(row => ({
      id: row[0], songId: row[1], creator: row[2], amount: row[3],
      videos: row[4], date: toDateString_(row[5]), notes: row[6], delivered: row[7], paid: row[8]
    }));
}

function addPayout(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payouts');
  const id = Utilities.getUuid();
  sheet.appendRow([
    id, params.songId, params.creator, params.amount,
    params.videos, params.date, params.notes || '', params.delivered || '', 'false'
  ]);
  return { success: true, id };
}

function deletePayout(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payouts');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) { sheet.deleteRow(i + 1); break; }
  }
  return { success: true };
}

function updatePayout(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payouts');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      sheet.getRange(i+1, 5).setValue(params.videos || '');
      sheet.getRange(i+1, 8).setValue(params.delivered || '');
      break;
    }
  }
  return { success: true };
}

function updatePayoutStatus(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Payouts');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      sheet.getRange(i+1, 9).setValue(params.paid);
      break;
    }
  }
  return { success: true };
}

function addExpense(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Expenses');
  const id = Utilities.getUuid();
  sheet.appendRow([
    id, params.month, params.year, params.name,
    params.amount, params.category, params.notes || ''
  ]);
  return { success: true, id };
}

function deleteExpense(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Expenses');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) { sheet.deleteRow(i + 1); break; }
  }
  return { success: true };
}

function addCreator(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Creators');
  const id = Utilities.getUuid();
  sheet.appendRow([id, params.handle, params.niche, params.rate || '', params.notes || '']);
  return { success: true, id };
}

function updateCreator(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Creators');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      sheet.getRange(i+1, 2).setValue(params.handle);
      sheet.getRange(i+1, 3).setValue(params.niche || '');
      sheet.getRange(i+1, 4).setValue(params.rate || '');
      sheet.getRange(i+1, 5).setValue(params.notes || '');
      break;
    }
  }
  return { success: true };
}

function deleteCreator(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Creators');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) { sheet.deleteRow(i + 1); break; }
  }
  return { success: true };
}
