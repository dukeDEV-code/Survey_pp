// ============================================================
//  Survey App - Google Apps Script Backend
//  Updated for Mobile App (Capacitor) - รองรับทุก action ผ่าน doPost
// ============================================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Survey App') 
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

function getOrCreateSheet() {
  var fileName = "FieldSurvey_Data"; 
  var files = DriveApp.getFilesByName(fileName);
  var sheet;
  if (files.hasNext()) {
    sheet = SpreadsheetApp.open(files.next());
  } else {
    sheet = SpreadsheetApp.create(fileName);
    var ws = sheet.getActiveSheet();
    ws.appendRow(["Timestamp", "Latitude", "Longitude", "LandUseCode", "Note", "ImageLinks"]);
    ws.setFrozenRows(1);
    ws.getRange("A1:F1").setFontWeight("bold").setBackground("#e0e0e0");
  }
  return sheet.getId();
}

function saveData(data) {
  try {
    var sheetId = getOrCreateSheet();
    var ws = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    var imageUrls = [];
    
    var folderName = "Survey_Photos";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    if (data.images && data.images.length > 0) {
      data.images.forEach(function(base64Data, i) {
        var splitData = base64Data.split(',');
        var contentType = splitData[0].substring(5, splitData[0].indexOf(';'));
        var bytes = Utilities.base64Decode(splitData[1]);
        
        var fileName = data.code + "_" + data.lat + "_" + new Date().getTime() + "_" + (i+1) + ".jpg";
        var blob = Utilities.newBlob(bytes, contentType, fileName);
        var file = folder.createFile(blob);
        
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imageUrls.push(file.getUrl());
      });
    }

    ws.appendRow([
      new Date(),
      data.lat,
      data.lng,
      data.code,
      data.note,
      imageUrls.join("\n")
    ]);
    
    return { success: true, message: "บันทึกสำเร็จ!" };

  } catch (e) {
    return { success: false, message: "Error: " + e.toString() };
  }
}

function deleteData(lat, lng) {
  try {
    var sheetId = getOrCreateSheet();
    var ws = SpreadsheetApp.openById(sheetId).getActiveSheet();
    var data = ws.getDataRange().getValues();
    var deleted = false;
    for (var i = data.length - 1; i > 0; i--) {
      if (parseFloat(data[i][1]).toFixed(6) === parseFloat(lat).toFixed(6)) {
        ws.deleteRow(i + 1);
        deleted = true;
      }
    }
    return { success: true, message: deleted ? "ลบข้อมูลเรียบร้อย" : "ลบจากแผนที่แล้ว" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function exportDataCSV() {
  try {
    var sheetId = getOrCreateSheet();
    var data = SpreadsheetApp.openById(sheetId).getActiveSheet().getDataRange().getValues();
    // ใส่ quote รอบ field ที่มี comma หรือ newline
    var csv = data.map(function(r) {
      return r.map(function(cell) {
        var s = String(cell == null ? "" : cell);
        if (s.indexOf(",") >= 0 || s.indexOf("\n") >= 0 || s.indexOf('"') >= 0) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(",");
    }).join("\n");
    return { success: true, csvText: csv };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function exportDataGeoJSON() {
  try {
    var sheetId = getOrCreateSheet();
    var data = SpreadsheetApp.openById(sheetId).getActiveSheet().getDataRange().getValues();
    var features = data.slice(1).map(function(r) {
      return {
        "type": "Feature",
        "geometry": { "type": "Point", "coordinates": [parseFloat(r[2]), parseFloat(r[1])] },
        "properties": { "Timestamp": r[0], "Code": r[3], "Note": r[4], "Images": r[5] }
      };
    });
    return { success: true, geojsonText: JSON.stringify({ "type": "FeatureCollection", "features": features }) };
  } catch (e) { return { success: false, message: e.toString() }; }
}

// ดึงไฟล์ KML/KMZ จาก Google Drive
function getKmlFilesFromDrive() {
  try {
    var folderName = "KML_KMZ";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : null;
    
    if (!folder) return { success: false, message: "ไม่พบโฟลเดอร์ชื่อ " + folderName };
    
    var files = folder.getFiles();
    var kmlDataList = [];
    
    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();
      var ext = fileName.split('.').pop().toLowerCase();
      
      if (ext === 'kml' || ext === 'kmz') {
        var content;
        if (ext === 'kml') {
          content = file.getBlob().getDataAsString();
        } else {
          content = Utilities.base64Encode(file.getBlob().getBytes());
        }
        
        kmlDataList.push({
          name: fileName,
          type: ext,
          content: content
        });
      }
    }
    return { success: true, files: kmlDataList };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// อัปโหลด KML/KMZ ลง Drive
function uploadKmlToDrive(base64Data, fileName) {
  try {
    var folderName = "KML_KMZ"; 
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    var contentType = fileName.endsWith('.kmz') ? 'application/vnd.google-earth.kmz' : 'application/vnd.google-earth.kml+xml';
    
    var rawData = base64Data.split(',')[1] || base64Data;
    var decodedData = Utilities.base64Decode(rawData);
    var blob = Utilities.newBlob(decodedData, contentType, fileName);
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return { success: true, message: "อัปโหลดสำเร็จ: " + fileName };
  } catch (e) {
    return { success: false, message: "Error: " + e.toString() };
  }
}

// ============================================================
//  doPost - Endpoint สำหรับมือถือ
//  รับ Content-Type: text/plain (ไม่ trigger CORS preflight)
// ============================================================
function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var data = requestData.payload || {};
    
    var result;
    
    if (action === 'saveData') {
      result = saveData(data); 
    } else if (action === 'getKmlFiles') {
      result = getKmlFilesFromDrive();
    } else if (action === 'deleteData') {
      result = deleteData(data.lat, data.lng);
    } else if (action === 'exportCSV') {
      result = exportDataCSV();
    } else if (action === 'exportGeoJSON') {
      result = exportDataGeoJSON();
    } else if (action === 'uploadKml') {
      result = uploadKmlToDrive(data.base64Data, data.fileName);
    } else {
      result = { success: false, message: "Unknown action: " + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "doPost error: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
