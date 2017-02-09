var path = require("path");

var fs = require("fs");

module.exports = {
  copyFile: copyFile,
  ensureDirectory: ensureDirectory
}

function copyFile(source, destination) {
  if (fs.existsSync(destination)) {
    console.warn("File already exists, aborting: " + destination);
  } else {
    copySync(source, destination);
    console.log("Created file: " + destination);
  }
};

function ensureDirectory(dirName) {
  var destination = path.resolve(".", dirName);
  if (fs.existsSync(destination)) {
    console.log("Directory already exists: " + destination);
  } else {
    fs.mkdirSync(destination);
    console.log("Created directory: " + destination);
  }
};

function copySync(source, destination) {
  var contents = fs.readFileSync(source);
  fs.writeFileSync(destination, contents);
}
