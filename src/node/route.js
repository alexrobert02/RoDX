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
    getData()
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

async function getData() {
  const uri =
    "mongodb+srv://securitate:securitate1@rodx.sprj1gy.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collection = database.collection(
      "2021_Admiterile la tratament, în funcție de drogul principal de consum și categoria de vârstă"
    );

    const result = await collection.findOne({ name: { $regex: /^\s*TOTAL\s*$/ } });
    return result;
  } catch (error) {
    console.error("Failed to retrieve data from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = handleRequest;
