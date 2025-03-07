function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Data"); // Change if your sheet name is different
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // Get header names

    // Find the column index for each header name
    const nameColumnIndex = headers.indexOf("Name");
    const emailColumnIndex = headers.indexOf("Email");
    const phoneColumnIndex = headers.indexOf("Phone Number");
    const timestampColumnIndex = headers.indexOf("Timestamp");

    // Check if all required columns are present
    if (nameColumnIndex === -1 || timestampColumnIndex === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Name or Timestamp column is missing" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Check if either email or phone is present
    if (emailColumnIndex === -1 && phoneColumnIndex === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Email or Phone Number column is missing" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (!data.email && !data.phone) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Either Email or Phone Number must be provided" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    const formattedName = normalizeName(data.name); // Normalize the name from the form

    // Check for duplicate name
    if (lastRow > 1) {
      const names = sheet.getRange(2, nameColumnIndex + 1, lastRow - 1, 1).getValues(); // Get all names in column Name
       const duplicate = names.flat().some(existingName => {
        return areNamesSimilar(formattedName, normalizeName(existingName));
      });

      if (duplicate) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: "Name already exists" })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Get the current timestamp
    const now = new Date();
    const formattedTimestamp = Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );

    // Insert new row
    sheet.insertRowAfter(lastRow);

    // Write the data to the correct columns
    sheet.getRange(lastRow + 1, nameColumnIndex + 1).setValue(data.name); // Original name
    if (emailColumnIndex !== -1){
      sheet.getRange(lastRow + 1, emailColumnIndex + 1).setValue(data.email);
    }
    if (phoneColumnIndex !== -1) {
      sheet.getRange(lastRow + 1, phoneColumnIndex + 1).setValue(data.phone);
    }
    sheet.getRange(lastRow + 1, timestampColumnIndex + 1).setValue(formattedTimestamp);

    // Return a success response
    return ContentService.createTextOutput(
      JSON.stringify({ message: "Data successfully written to sheet" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(error);
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Error writing to sheet: " + error })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to normalize a name (lowercase, trim, remove extra spaces)
function normalizeName(name) {
  if (typeof name !== 'string') return ""; // Handle non-string inputs
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Helper function to compare two normalized names (check all combinations of the names)
function areNamesSimilar(name1, name2) {
  const words1 = name1.split(' ').filter(word => word !== "");
  const words2 = name2.split(' ').filter(word => word !== "");

  if (words1.length !== words2.length) {
    return false; // Different number of words cannot be similar
  }

  if (words1.length === 1 && words2.length === 1) {
    return words1[0] === words2[0]; // Both names have only one word
  }

  // Check all combinations
  return (words1[0] === words2[0] && words1[1] === words2[1]) || // Same order
         (words1[0] === words2[1] && words1[1] === words2[0]);   // Reverse order
}
