const express = require("express");
// const secure = require("./../middlewares/secure.mid");
const apiRouter = express.Router();
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

function getFormats(result) {
  let jpg = 0;
  let png = 0;
  let svg = 0;
  let otherFormats = 0;
  result.resources.forEach(image => {
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
function getBiggestPicture(result) {
  let maxSize = Math.max.apply(
    Math,
    result.resources.map(function(size) {
      return size.bytes;
    })
  );
  let biggestPicture = result.resources.find(function(image) {
    return image.bytes == maxSize;
  });
  return biggestPicture.url;
}
function getSmallestPicture(result) {
  let minSize = Math.min.apply(
    Math,
    result.resources.map(function(size) {
      return size.bytes;
    })
  );
  let smallestPicture = result.resources.find(function(image) {
    return image.bytes == minSize;
  });
  return smallestPicture.url;
}
function getAverageSize(result) {
  let totalBytes = result.resources.reduce(function (a, b) {
    return {bytes: a.bytes + b.bytes}; 
  })
  return totalBytes.bytes / result.resources.length
}

apiRouter.get("/statistics", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  var options = (options = { type: "upload", max_results: 500 });
  cloudinary.v2.api.resources(options, function(error, result) {
    let totalImages = result.resources.length;
    let formats = getFormats(result);
    let biggestPicture = getBiggestPicture(result);
    let smallestPicture = getSmallestPicture(result);
    let avgSize = getAverageSize(result)
    let infoToShow = {
      totalImages: totalImages,
      formats: formats,
      biggestPicture: biggestPicture,
      smallestPicture: smallestPicture,
      avgSize: avgSize
    };
    res.json(infoToShow);
  });
});

module.exports = apiRouter;
