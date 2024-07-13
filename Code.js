var mainSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Llamadas');
var historySheetName = 'Historial';

function addStatusColumn() {
  var dataRange = mainSheet.getDataRange();
  var lastRow = dataRange.getLastRow();
  var lastColumn = dataRange.getLastColumn();

  var columnName = 'Estado';
  var columnExists = mainSheet.getRange(1, lastColumn).getDisplayValue() === columnName;

  if (columnExists) {
    return;
  }
  
  var dropdownOptions = [
    'Contactado',
    'Esperando respuesta',
    'En llamada',
    'Win',
    'Lose',
  ];

  mainSheet.getRange(1, lastColumn + 1)
    .setBackgroundRGB(0 ,0 ,0)
    .setFontColor('#FFF')
    .setValue(columnName)
    .setFontWeight('bold');
  
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(dropdownOptions)
    .setAllowInvalid(false)
    .build();

  mainSheet.getRange(2, lastColumn + 1, lastRow, 1).setDataValidation(rule);
}

function addHistorySheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(historySheetName);
  
  if (sheet) {
    return;
  }

  sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(historySheetName);
  ['Lead', 'Estado', 'Fecha Hora'].forEach(
    (column, index) => sheet.getRange(1, index + 1)
      .setBackgroundRGB(0 ,0 ,0)
      .setFontColor('#FFF')
      .setValue(column)
      .setFontWeight('bold')
  )
}

function getLeads() {
  var dataRange = mainSheet.getDataRange();
  var lastRow = dataRange.getLastRow();
  var lastColumn = dataRange.getLastColumn();

  var range = mainSheet.getRange(2, 1, lastRow, lastColumn);
  var values = range.getValues();

  var leads = [];
  values.forEach((row, index) => {
    if (row[1] === '') {
      return;
    }

    leads.push({
      text: row[1],
      value: index + 2, // Excel row number
      status: row[8],
    });
  });

  return leads;
}

function getHistory() {
  var historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(historySheetName);
  var dataRange = historySheet.getDataRange();

  var range = historySheet.getRange(2, 1, dataRange.getLastRow(), dataRange.getLastColumn());
  var values = range.getValues();

  var history = [];
  values.forEach((row) => {
    if (row[0] === '') {
      return;
    }

    history.push({
      lead: row[0],
      status: row[1],
      date: row[2].toLocaleString(),
    });
  });

  console.log(history);

  return history;
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function updateStatuses(lead, status) {
  var dataRange = mainSheet.getDataRange();
  var lastColumn = dataRange.getLastColumn();

  mainSheet.getRange(lead, lastColumn)
    .setValue(status);
  
  return saveHistory(lead, status);
}

function saveHistory(lead, status) {
  var cell = mainSheet.getRange(`B${lead}`);

  var historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(historySheetName);
  var nextRow = historySheet.getDataRange().getLastRow() + 1;
  var date = new Date();

  historySheet.getRange(nextRow, 1).setValue(cell.getValue());
  historySheet.getRange(nextRow, 2).setValue(status);
  historySheet.getRange(nextRow, 3).setValue(date).setNumberFormat('dd/MM/yyyy h:mm:ss AM/PM');

  return {
    lead: cell.getValue(),
    status,
    date: date.toLocaleString(),
  }
}

addStatusColumn();
addHistorySheet();