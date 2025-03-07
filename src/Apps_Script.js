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

    // Check for required data
    if (!data.name) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Name must be provided" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    if (!data.email && !data.phone) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Either Email or Phone Number must be provided" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    const formattedName = normalizeName(data.name); // Normalize the name from the form
    const formattedEmail = normalizeEmail(data.email);
    const formattedPhone = normalizePhone(data.phone);
    let errorMessage = "";
    let duplicateFound = false;

    // Check for duplicate (name, email, and phone)
    if (lastRow > 1) {
      const existingData = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues(); // Get all data

      duplicateFound = existingData.some(row => {
        const existingName = normalizeName(row[nameColumnIndex]);
        const existingEmail = normalizeEmail(row[emailColumnIndex]);
        const existingPhone = normalizePhone(row[phoneColumnIndex]);

        if (areNamesSimilar(formattedName, existingName)) {
          if (formattedEmail && existingEmail) { //if the new entry has an email and the old one too
            if (areEmailsSimilar(formattedEmail, existingEmail)) {
              errorMessage = "Duplicate entry found (name and email combination)";
              return true;
            }
          }
          if (formattedPhone && existingPhone) { //if the new entry has a phone and the old one too
            if (arePhonesSimilar(formattedPhone, existingPhone)) {
              errorMessage = "Duplicate entry found (name and phone number combination)";
              return true;
            }
          }
        }
        return false; // No duplicate found for this row
      });
    }

    if (duplicateFound) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: errorMessage })
      ).setMimeType(ContentService.MimeType.JSON);
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
    sheet.getRange(lastRow + 1, nameColumnIndex + 1).setValue(convertToCamelCase(data.name)); //Convert the name to camel case
    if (emailColumnIndex !== -1) {
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

// Helper function to normalize email (lowercase, trim)
function normalizeEmail(email) {
  if (typeof email !== 'string' || email === "") return null; // Handle non-string inputs
  return email.toLowerCase().trim();
}

// Helper function to check for email similarity
function areEmailsSimilar(email1, email2) {
  return email1 === email2;
}

// Helper function to normalize phone (remove non-numeric chars, trim)
function normalizePhone(phone) {
  if (typeof phone !== 'string' || phone === "") return null; // Handle non-string inputs or empty value
  return phone.replace(/[^0-9]/g, '').trim();
}

// Helper function to check for phone number similarity
function arePhonesSimilar(phone1, phone2) {
  return phone1 === phone2;
}

// Helper function to convert string to camel case and remove multiple spaces
function convertToCamelCase(str) {
  if (typeof str !== 'string') return ""; // Handle non-string inputs
  return str
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .toLowerCase() // Convert to lowercase
    .split(' ') // Split into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join the words back together
}
