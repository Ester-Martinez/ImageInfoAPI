const axios = require("axios");

class ImageApi {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  getImages() {
    
    return axios.get(`${this.baseURL}resources/images`);
  }
  getMoreImages(next_cursor) {
    return axios.get(`${this.baseURL}resources?/&next_cursor=${next_cursor}`);
  }
}
module.exports = ImageApi;