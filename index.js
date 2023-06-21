var http = require("http");
var Routes = require("./src/node/route.js");
var xlsx = require("xlsx"); // Import the xlsx library
const fs = require('fs');
const path = require('path');
const ExcelJS = require("exceljs");
const { MongoClient } = require("mongodb"); // Import the MongoClient

const uri =
  "mongodb+srv://securitate:securitate1@rodx.sprj1gy.mongodb.net/?retryWrites=true&w=majority";

const dbName = "RoDX";

// verificam daca este delimitator de tabele
function isRowEmpty(rowValues) {
  return rowValues.every((value) => value === null || value === undefined);
}

async function readExcelFile(filePath) {
  const documentTitleRegex = /\\([^\\]+)\.xlsx$/; // Regular expression to extract the document title from the filePath
  const documentTitleMatch = filePath.match(documentTitleRegex);
  const documentTitle = documentTitleMatch ? documentTitleMatch[1] : ""; // Extract the document title from the filePath, or set it to an empty string if not found

  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(filePath);

    const collections = {}; // Object to store collections

    const worksheet = workbook.worksheets[0]; // Get the first sheet

    let currentSection = ""; // Track the current section
    let headers = []; // Array to store column headers
    let rowbeforeisempty = false;
    let currentrowisempty = true;
    let tabledata = false;
    let tableheader = false;
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      currentrowisempty = isRowEmpty(row.values);
      if (tabledata === true && currentrowisempty === false) {
        const rowData = row.values.slice(1); // Exclude the first cell
        const collectionKey = documentTitle + "_" + currentSection; // Concatenate documentTitle with currentSection to form the collection key
        if (!collections[collectionKey]) {
          collections[collectionKey] = []; // Initialize the collection array
        }
        const collection = collections[collectionKey];
        const data = {};

        rowData.forEach((value, index) => {
          const header = headers[index]; // Add 1 to account for excluded first cell
          data[header] = value;
        });

        collection.push(data);
      }
      if (tableheader === true && currentrowisempty === true) {
        delete collections[documentTitle + "_" + currentSection];
        tabledata = false;
        tableheader = false;
      }
      if (tableheader === true) {
        // First row contains column headers
        headers = row.values.slice(1);
        headers[0] = "name";
        tabledata = true;
        tableheader = false;
      }

      if (rowbeforeisempty === true && currentrowisempty === false) {
        currentSection = row.getCell(1).text; // Set current section
        tableheader = true;
        tabledata = false;
      }

      if (rowbeforeisempty === true && currentrowisempty === true) {
        currentSection = "";
        tabledata = false;
        tableheader = false;
      }

      rowbeforeisempty = currentrowisempty;
    });

    console.log("Data read successfully!");

    // Return the collections object
    //console.log(collections);
    return collections;
  } catch (err) {
    console.error("Error reading Excel file:", err);
    return null;
  }
}



async function insertData(collectionName, data) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertMany(data);

    console.log("Data inserted successfully!");
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    client.close();
  }
}

const PORT = 3000;

var server = http.createServer(Routes);

server.listen(PORT, function () {
  console.log("Server listening on: http://localhost:%s", PORT);
});

// Function to read all files in a directory
function readFilesInDirectory(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

// Function to check if a file is an Excel file
function isExcelFile(filePath) {
  return filePath.toLowerCase().endsWith(".xlsx");
}

// Function to process all Excel files in a directory
async function processExcelFilesInDirectory(directoryPath) {
  try {
    const files = await readFilesInDirectory(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      if (isExcelFile(filePath)) {
        try {
          const collections = await readExcelFile(filePath);
          if (collections) {
            // Insert data into respective collections
            Object.entries(collections).forEach(([collectionName, data]) => {
              insertData(collectionName, data);
            });
          }
        } catch (err) {
          console.error("Error processing file:", err);
        }
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
}

const folderPath = "./docs"; // Specify the folder path here

// processExcelFilesInDirectory(folderPath);