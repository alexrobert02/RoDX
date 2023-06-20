var url = require("url");
var fs = require("fs");
var appRootPath = require("app-root-path");
var path = require("path");
const { MongoClient } = require("mongodb");

function handleRequest(req, res) {
  var requestUrl = url.parse(req.url).pathname;
  var fsPath;

  if (requestUrl === "/") {
    fsPath = path.resolve(appRootPath + "/src/views/mainpage.html");
  } else if (requestUrl === "/help") {
    fsPath = path.resolve(appRootPath + "/src/views/helppage.html");
  } else if (requestUrl === "/druglist") {
    fsPath = path.resolve(appRootPath + "/src/views/popular_drugs.html");
  } else if (requestUrl === "/yearselect") {
    fsPath = path.resolve(appRootPath + "/src/views/select_year.html");
  } else if (requestUrl === "/statisticdocs") {
    fsPath = path.resolve(appRootPath + "/src/views/statisticdocs.html");
  } else if (requestUrl === "/statistic") {
    fsPath = path.resolve(appRootPath + "/src/views/statistic.html");
  } else if (requestUrl === "/login") {
    fsPath = path.resolve(appRootPath + "/src/views/login.html");
  } else if (requestUrl === "/register") {
    fsPath = path.resolve(appRootPath + "/src/views/register.html");
  } else if (requestUrl === "/getData") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const collectionName = urlParams.get("collectionName");
    const itemName = urlParams.get("itemName");

    if (!collectionName || !itemName) {
      res.statusCode = 400;
      res.end("Missing collectionName or itemName parameter");
      return;
    }

    getData(collectionName, itemName)
      .then((result) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end("Error retrieving data from MongoDB");
      });
    return;
  } else if (requestUrl === "/getOptions") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const collectionName = urlParams.get("collectionName");

    if (!collectionName) {
      res.statusCode = 400;
      res.end("Missing collectionName");
      return;
    }

    getOptions(collectionName)
      .then((result) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end("Error retrieving data from MongoDB");
      });
    return;
  
  } else if (requestUrl === "/getCollections") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const documentName = urlParams.get("documentName");

    if (!documentName) {
      res.statusCode = 400;
      res.end("Missing documentName");
      return;
    }

    getCollections(documentName)
      .then((result) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end("Error retrieving collections from MongoDB");
      });
    return;
  } else if (path.extname(requestUrl) === ".css") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "text/css");
  } else if (path.extname(requestUrl) === ".png") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "image/png");
  } else if (path.extname(requestUrl) === ".jpg") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "image/jpeg");
  } else if (path.extname(requestUrl) === ".js") {
    fsPath = path.resolve(appRootPath + "/src" + requestUrl);
    res.setHeader("Content-Type", "text/javascript");
  } else {
    fsPath = path.resolve(appRootPath + "/src/views/404.html");
  }

  fs.stat(fsPath, function (err, stat) {
    if (err) {
      console.log("ERROR :(((: " + err);
      res.statusCode = 404;
      res.end();
    } else {
      res.statusCode = 200;
      fs.createReadStream(fsPath).pipe(res);
    }
  });
}


async function getCollections(documentName) {
  const uri =
    "mongodb+srv://securitate:securitate1@rodx.sprj1gy.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  const decodedDocumentName = decodeURIComponent(documentName);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collections = await database.listCollections().toArray();
    
    const filteredCollections = collections
      .map(collection => collection.name)
      .filter(name => name.startsWith(decodedDocumentName + "_"))
      .map(name => name.split('_')[1]);

    return filteredCollections;

  } catch (error) {
    console.error("Failed to retrieve collections from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}


async function getOptions(collectionName) {
  const uri =
    "mongodb+srv://securitate:securitate1@rodx.sprj1gy.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  const decodedCollectionName = decodeURIComponent(collectionName);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collection = database.collection(decodedCollectionName);

    const options = await collection.distinct("name");

    return options;

  } catch (error) {
    console.error("Failed to retrieve options from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function getData(collectionName, itemName) {
  const uri =
    "mongodb+srv://securitate:securitate1@rodx.sprj1gy.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  const decodedCollectionName = decodeURIComponent(collectionName);
  const decodedItemName = decodeURIComponent(itemName);
  console.log(decodedItemName);
  console.log(decodedCollectionName);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collection = database.collection(decodedCollectionName);

    const regexItemName = decodedItemName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regexQuery = new RegExp(regexItemName);

    const result = await collection.findOne({
      name: regexQuery
    });
    return result;

    return result;
  } catch (error) {
    console.error("Failed to retrieve data from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = handleRequest;
