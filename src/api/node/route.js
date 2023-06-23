var url = require("url");
var fs = require("fs");
var appRootPath = require("app-root-path");
var path = require("path");
const { MongoClient } = require("mongodb");
var RegisterRoute = require("./registerDB.js");
var LoginRoute = require("./loginDB.js");
var cookie = require("cookie");
const bcrypt = require("bcrypt");

const mongoURL = process.env.DB_URL;

function handleRequest(req, res) {
  var requestUrl = url.parse(req.url).pathname;
  var fsPath;

  if (
    (requestUrl === "/help" ||
      requestUrl === "/druglist" ||
      requestUrl === "/yearselect" ||
      requestUrl === "/statisticdocs" ||
      requestUrl === "/statistic" ||
      requestUrl === "/") &&
    !isLoggedIn(req)
  ) {
    res.statusCode = 302;
    res.setHeader("Location", "/login");
    res.end();
    return;
  }

  if (
    (requestUrl === "/login" || requestUrl === "/register") &&
    isLoggedIn(req)
  ) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

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
  } else if (requestUrl === "/documentation") {
    fsPath = path.resolve(appRootPath + "/docs/documentation.html");
  } else if (requestUrl === "/myaccount") {
    fsPath = path.resolve(appRootPath + "/src/views/myaccount.html");
  } else if (requestUrl === "/admin") {
    if (isAdminLoggedIn(req)) {
      fsPath = path.resolve(appRootPath + "/src/views/admin.html");
    } else {
      res.statusCode = 403; // Forbidden
      res.end("Access denied");
      return;
    }
  } else if (requestUrl === "/getData" && req.method === "GET") {
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
  } else if (requestUrl === "/getUser" && req.method === "GET") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const email = urlParams.get("email");
    if (!email) {
      res.statusCode = 400;
      res.end("Missing email");
      return;
    }

    getUser(email)
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
  } else if (requestUrl === "/getOptions" && req.method === "GET") {
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
  } else if (requestUrl === "/getCollections" && req.method === "GET") {
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
  } else if (requestUrl === "/getCollection" && req.method === "GET") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const collectionName = urlParams.get("collectionName");

    if (!collectionName) {
      res.statusCode = 400;
      res.end("Missing collectionName");
      return;
    }

    getCollection(collectionName)
      .then((result) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end("Error retrieving collection from MongoDB");
      });
    return;
  } else if (requestUrl === "/updateUser" && req.method === "PUT") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const email = urlParams.get("email");

    if (!email) {
      res.statusCode = 400;
      res.end("Missing email");
      return;
    }

    // Parse the request body
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const userData = JSON.parse(body);
        updateUser(email, userData)
          .then((result) => {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          })
          .catch((err) => {
            res.statusCode = 500;
            res.end("Error updating user in the database");
          });
      } catch (error) {
        res.statusCode = 400;
        res.end("Invalid JSON payload");
      }
    });

    return;
  } else if (requestUrl === "/getAllUsers" && req.method === "GET") {
    getUsers()
      .then((result) => {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end("Error retrieving users from MongoDB");
      });
    return;
  } else if (requestUrl === "/deleteUser" && req.method === "DELETE") {
    const urlParams = new URLSearchParams(url.parse(req.url).query);
    const email = urlParams.get("email");

    if (!email) {
      res.statusCode = 400;
      res.end("Missing userEmail");
      return;
    }

    deleteUser(email)
      .then((result) => {
        if (result.deletedCount === 1) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "User deleted successfully" }));
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "User not found" }));
        }
      })
      .catch((err) => {
        console.error("Error deleting user from MongoDB", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Error deleting user from MongoDB" }));
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
    fsPath = path.resolve(appRootPath + "/src/views/404page.html");
  }

  if (requestUrl === "/login" && req.method === "POST") {
    LoginRoute(req, res);
    return;
  } else if (requestUrl === "/register" && req.method === "POST") {
    RegisterRoute(req, res);
    return;
  } else if (requestUrl === "/logout") {
    res.setHeader("Set-Cookie", [
      "Logat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
      "Role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
    ]);
    res.statusCode = 302;
    res.setHeader("Location", "/login");
    res.end();
    return;
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
  const client = new MongoClient(mongoURL);
  const decodedDocumentName = decodeURIComponent(documentName);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collections = await database.listCollections().toArray();

    const filteredCollections = collections
      .map((collection) => collection.name)
      .filter((name) => name.startsWith(decodedDocumentName + "_"))
      .map((name) => name.split("_")[1]);

    return filteredCollections;
  } catch (error) {
    console.error("Failed to retrieve collections from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function getOptions(collectionName) {
  const client = new MongoClient(mongoURL);
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
  const client = new MongoClient(mongoURL);
  const decodedCollectionName = decodeURIComponent(collectionName);
  const decodedItemName = decodeURIComponent(itemName);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collection = database.collection(decodedCollectionName);

    const regexItemName = decodedItemName.replace(
      /[-[\]{}()*+?.,\\^$|#\s]/g,
      "\\$&"
    );
    const regexQuery = new RegExp(regexItemName);

    const result = await collection.findOne({
      name: regexQuery,
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

async function getCollection(collectionName) {
  const client = new MongoClient(mongoURL);
  const decodedCollectionName = decodeURIComponent(collectionName);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("RoDX");
    const collection = database.collection(decodedCollectionName);

    const result = await collection.find().toArray();

    return result;
  } catch (error) {
    console.error("Failed to retrieve collection from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

function isLoggedIn(req) {
  var cookies = cookie.parse(req.headers.cookie || "");

  if (cookies.Logat) {
    return true;
  } else {
    return false;
  }
}

module.exports = handleRequest;

async function getUsers() {
  const client = new MongoClient(mongoURL);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("User");
    const collection = database.collection("users");

    const query = { role: { $ne: "admin" } };
    const projection = { _id: 0 };

    const result = await collection.find(query).project(projection).toArray();

    return result;
  } catch (error) {
    console.error("Failed to retrieve users from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function deleteUser(email) {
  const client = new MongoClient(mongoURL);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("User");
    const collection = database.collection("users");

    const result = await collection.deleteOne({ email });

    return result;
  } catch (error) {
    console.error("Failed to delete user from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

function isAdminLoggedIn(req) {
  var cookies = cookie.parse(req.headers.cookie || "");

  if (cookies.Logat && cookies.Role === "admin") {
    // Assuming the admin role is stored in the "Role" cookie
    return true;
  } else {
    return false;
  }
}

async function updateUser(email, userData) {
  const client = new MongoClient(mongoURL);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("User");
    const collection = database.collection("users");

    // Check if the new password is different from the current one
    if (userData.password && userData.password !== "") {
      const user = await collection.findOne({ email });
      if (user && userData.password === user.password) {
        // New password is the same as the current one, no need to update
        delete userData.password; // Remove the password field from the update data
      } else {
        // Hash the new password
        const hashedPassword = bcrypt.hashSync(userData.password, 10);
        userData.password = hashedPassword;
      }
    }

    const result = await collection.updateOne({ email }, { $set: userData });

    return result;
  } catch (error) {
    console.error("Failed to update user in MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function getUser(email) {
  const client = new MongoClient(mongoURL);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("User");
    const collection = database.collection("users");

    const query = { email };
    const projection = { _id: 0 };

    const result = await collection.findOne(query, { projection });

    return result;
  } catch (error) {
    console.error("Failed to retrieve user from MongoDB", error);
    throw error;
  } finally {
    await client.close();
  }
}
