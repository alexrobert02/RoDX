var http = require("http");
var Routes = require("./src/node/route.js");
var xlsx = require("xlsx"); // Import the xlsx library
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
  const yearRegex = /(\d{4})\.xlsx$/; // Regular expression to extract the year from the filePath
  const yearMatch = filePath.match(yearRegex);
  const year = yearMatch ? yearMatch[1] : ""; // Extract the year from the filePath, or set it to an empty string if not found

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
        const collectionKey = year + "_" + currentSection; // Concatenate year with currentSection to form the collection key
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
        delete collections[year + "_" + currentSection];
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

// Read the Excel file and extract data from multiple tables
var workbook = xlsx.readFile("./docs/tdi-date-guvern-2021.xlsx");

// Usage:
//const filePath = "./docs/tdi-date-guvern-2021.xlsx";
const filePaths = [
  "./docs/tdi-date-guvern-2021.xlsx",
  "./docs/boli-infectioase-2021.xlsx",
  "./docs/urgente_medicale_2021.xlsx",
];

filePaths.forEach(async (filePath) => {
  try {
    const collections = await readExcelFile(filePath);
    if (collections) {
      // Insert data into respective collections
      Object.entries(collections).forEach(([collectionName, data]) => {
        //insertData(collectionName, data);
      });
    }
  } catch (err) {
    console.error("Error processing file:", err);
  }
});