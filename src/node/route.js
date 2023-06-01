var url = require("url");
var fs = require("fs");
var appRootPath = require("app-root-path");
var path = require("path");

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
  } else if (requestUrl === "/statistic") {
    fsPath = path.resolve(appRootPath + "/src/views/statistic.html");
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
    res.setHeader("Content-Type", "text/js");
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

module.exports = handleRequest;
