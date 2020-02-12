const express = require("express");
const ensureLogin = require("connect-ensure-login");
const apiRouter = express.Router();
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

function getFormats(results) {
  let jpg = 0;
  let png = 0;
  let svg = 0;
  let otherFormats = 0;
  results.forEach(image => {
    if (image.format === "jpg") {
      jpg++;
    } else if (image.format === "png") {
      png++;
    } else if (image.format === "svg") {
      svg++;
    } else {
      otherFormats++;
    }
  });
  return (formats = {
    jpg: jpg,
    png: png,
    svg: svg,
    otherFormats: otherFormats
  });
}
function getBiggestPicture(results) {
  let maxSize = Math.max.apply(
    Math,
    results.map(function(size) {
      return size.bytes;
    })
  );
  let biggestPicture = results.find(function(image) {
    return image.bytes == maxSize;
  });
  return biggestPicture.url;
}
function getSmallestPicture(results) {
  let minSize = Math.min.apply(
    Math,
    results.map(function(size) {
      return size.bytes;
    })
  );
  let smallestPicture = results.find(function(image) {
    return image.bytes == minSize;
  });
  return smallestPicture.url;
}
function getAverageSize(results) {
  let totalBytes = results.reduce(function(a, b) {
    return { bytes: a.bytes + b.bytes };
  });
  return Math.trunc(totalBytes.bytes / results.length);
}

apiRouter.get(
  "/statistics",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    let results = [];

    function callToCloudinary(cursorParam = "") {
      var options = (options = {
        type: "upload",
        max_results: 500,
        next_cursor: cursorParam
      });

      cloudinary.v2.api.resources(options, function(error, result) {
        result.resources.forEach(resource => results.push(resource));

        if (result.hasOwnProperty("next_cursor")) {
          callToCloudinary(result.next_cursor);
        } else {
          let totalImages = results.length;
          let formats = getFormats(results);
          let biggestPicture = getBiggestPicture(results);
          let smallestPicture = getSmallestPicture(results);
          let avgSize = getAverageSize(results);
          let infoToShow = {
            totalImages: totalImages,
            formats: formats,
            biggestPicture: biggestPicture,
            smallestPicture: smallestPicture,
            avgSize: avgSize
          };
          res.json(infoToShow);
        }
      });
    }
    callToCloudinary();
  }
);

apiRouter.get(
  "/csv",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    let results = [];

    function callToCloudinary(cursorParam = "") {
      var options = (options = {
        type: "upload",
        max_results: 500,
        next_cursor: cursorParam
      });

      cloudinary.v2.api.resources(options, function(error, result) {
        result.resources.forEach(resource => results.push(resource));

        if (result.hasOwnProperty("next_cursor")) {
          callToCloudinary(result.next_cursor);
        } else {
          var keys = Object.keys(results[0]);
          var csv = results.map(function(row) {
            return keys
              .map(function(keyName) {
                return JSON.stringify(row[keyName]);
              })
              .join(",");
          });
          csv.unshift(keys.join(","));
          csv = csv.join("\r\n");
          res.json(csv);
        }
      });
    }
    callToCloudinary();
  }
);

module.exports = apiRouter;
