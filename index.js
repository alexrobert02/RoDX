//importuri
var http = require("http");
var Routes = require("./src/api/node/route.js");
var xlsx = require("xlsx"); 
const fs = require('fs');
const path = require('path');
const ExcelJS = require("exceljs");
const { MongoClient } = require("mongodb");
const mongoURL = process.env.DB_URL;
const dbName = "RoDX";

// verificam daca este delimitator de tabele
function isRowEmpty(rowValues) {
  return rowValues.every((value) => value === null || value === undefined);
}

async function readExcelFile(filePath) {
  const documentTitleRegex = /\\([^\\]+)\.xlsx$/; // regex pentru extragerea titlului documentului
  const documentTitleMatch = filePath.match(documentTitleRegex);
  const documentTitle = documentTitleMatch ? documentTitleMatch[1] : ""; // extragem titlul documentului (sau null daca nu e gasit)

  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(filePath);

    const collections = {}; // stocare collectii

    const worksheet = workbook.worksheets[0]; 

    let currentSection = ""; 
    let headers = []; // stocam headerele coloanelor
    let rowbeforeisempty = false;
    let currentrowisempty = true;
    let tabledata = false;
    let tableheader = false;
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      currentrowisempty = isRowEmpty(row.values);
      // procesarea datelor tabelei
      if (tabledata === true && currentrowisempty === false) {
        const rowData = row.values.slice(1); // excludem prima celula
        const collectionKey = documentTitle + "_" + currentSection; // concatenam titlul documentului cu sectiunea curenta pentru a forma collection key
        if (!collections[collectionKey]) {
          collections[collectionKey] = []; // initializare
        }
        const collection = collections[collectionKey];
        const data = {};

        rowData.forEach((value, index) => {
          const header = headers[index];
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
        // primul rand contine  headerele
        headers = row.values.slice(1);
        headers[0] = "name";
        tabledata = true;
        tableheader = false;
      }

      if (rowbeforeisempty === true && currentrowisempty === false) {
        currentSection = row.getCell(1).text; // sectiunea curenta
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

    // returnam colectia
    //console.log(collections);
    return collections;
  } catch (err) {
    console.error("Error reading Excel file:", err);
    return null;
  }
}



async function insertData(collectionName, data) {
  const client = new MongoClient(mongoURL);

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

// citim toate fisierele dintr-un director
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

// verificam daca un fisier e excel
function isExcelFile(filePath) {
  return filePath.toLowerCase().endsWith(".xlsx");
}

// procesarea fisierelor excel
async function processExcelFilesInDirectory(directoryPath) {
  try {
    const files = await readFilesInDirectory(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      if (isExcelFile(filePath)) {
        try {
          const collections = await readExcelFile(filePath);
          if (collections) {
            // inserare date in colectii
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

const folderPath = "./src/api/xlsx"; // folder-path

//processExcelFilesInDirectory(folderPath);