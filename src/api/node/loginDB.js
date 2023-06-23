require("dotenv").config();
var url = require("url");
var fs = require("fs");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const mongoURL = process.env.DB_URL;
const dbName = "User";

function generateToken() {
  return uuidv4();
}

function handleLoginRequest(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { email, password } = parseFormData(body);
    const user = await findUser(email);

    if (
      user &&
      bcrypt.compareSync(password, user.password) &&
      user.role === "admin"
    ) {
      const token = generateToken();
      const cookies = [`Logat=${token}; Path=/;`, `Role=admin; Path=/;`];
      res.setHeader("Set-Cookie", cookies);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Te-ai logat cu succes");
          window.location.href = "/";
        </script>
      `);
      res.end();
    } else if (
      user &&
      bcrypt.compareSync(password, user.password) &&
      user.role === "user"
    ) {
      const token = generateToken();
      res.setHeader("Set-Cookie", `Logat=${token}; Path=/;`);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Te-ai logat cu succes");
          window.location.href = "/";
        </script>
      `);
      res.end();
    } else {
      res.setHeader("Content-Type", "text/html");
      res.write(`
        <script>
          alert("Ati introdus gresit email-ul sau parola !!!");
          window.location.href = "/login";
        </script>
      `);
      res.end();
    }
  });
}

async function findUser(email) {
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection("users");

  const user = await collection.findOne({ email });

  client.close();

  return user;
}

function parseFormData(formData) {
  const data = {};
  const formFields = formData.split("&");

  for (let i = 0; i < formFields.length; i++) {
    const [key, value] = formFields[i].split("=");
    data[key] = decodeURIComponent(value);
  }

  return data;
}

module.exports = handleLoginRequest;
