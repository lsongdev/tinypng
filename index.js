const fs = require('fs');
const https = require('https');
const assert = require('assert');
const Stream = require('stream');

const get = url =>
  new Promise(done => https.get(url, done));

const post = (url, headers, body) =>
  new Promise((resolve, reject) => {
    assert.equal(typeof url, 'string');
    assert.equal(typeof headers, 'object');
    if (typeof body === 'object' && !(body instanceof Stream)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const req = https.request(url, {
      method: 'post',
      headers,
    }, resolve);
    req.on('error', reject);
    if (body instanceof Stream) {
      body.pipe(req);
    } else {
      req.end(body);
    }
    return req;
  });

const base64 = str =>
  Buffer.from(str).toString('base64');

const readStream = stream => {
  const buffer = [];
  return new Promise((resolve, reject) => {
    stream
      .on('error', reject)
      .on('data', chunk => buffer.push(chunk))
      .on('end', () => resolve(Buffer.concat(buffer)))
  });
};

const handleError = res => {
  if (res.error) {
    const err = new Error(res.message);
    err.name = res.error;
    throw err;
  }
  return res;
};

/**
 * Resizing images
 * @docs https://tinypng.com/developers/reference#resizing-images
 */
const processor = (key, url) => {
  assert.equal(typeof key, 'string');
  assert.equal(typeof url, 'string');
  const headers = {
    Authorization: 'Basic ' + base64(`api:${key}`)
  };
  return {
    get url() {
      return url;
    },
    /**
     * get output stream
     */
    image() {
      return get(this.url);
    },
    /**
     * save
     * @param {String} filename 
     * @returns {Stream} stream
     */
    async save(filename) {
      assert.equal(typeof filename, 'string');
      const image = await this.image();
      return image.pipe(fs.createWriteStream(filename));
    },
    /**
     * Use the API to create resized versions of your uploaded images. 
     * By letting the API handle resizing you avoid having to write 
     * such code yourself and you will only have to upload your image once. 
     * The resized images will be optimally compressed with a nice and crisp appearance.
     * @param {String} method 
     * @param {Number} width 
     * @param {Number} height 
     * @returns {Stream} stream
     */
    resize(method, width, height) {
      assert.equal(typeof method, 'string');
      assert.equal(typeof width, 'number');
      assert.equal(typeof height, 'number');
      const resize = { method, width, height };
      return Promise
        .resolve()
        .then(() => post(url, headers, { resize }))
        .then(response => {
          response.save = filename => 
            response.pipe(fs.createWriteStream(filename));
          return response;
        });
    },
    /**
     * scale
     * Scales the image down proportionally. 
     * You must provide either a target width or a target height, 
     * but not both. The scaled image will have exactly the provided width or height.
     * @param {Number} width 
     * @param {Number} height 
     * @returns {Stream} stream
     */
    scale(width, height) {
      return this.resize('scale', width, height);
    },
    /**
     * fit
     * Scales the image down proportionally so that it fits within the given dimensions. 
     * You must provide both a width and a height. 
     * The scaled image will not exceed either of these dimensions.
     * @param {Number} width
     * @param {Number} height
     * @returns {Stream} stream
     */
    fit(width, height) {
      return this.resize('fit', width, height);
    },
    /**
     * cover
     * Scales the image proportionally and crops it if necessary 
     * so that the result has exactly the given dimensions. 
     * You must provide both a width and a height. 
     * Which parts of the image are cropped away is determined automatically. 
     * An intelligent algorithm determines the most important areas of your image.
     * @param {Number} width 
     * @param {Number} height 
     * @returns {Stream} stream
     */
    cover(width, height) {
      return this.resize('cover', width, height);
    },
    /**
     * thumb
     * A more advanced implementation of cover that also 
     * detects cut out images with plain backgrounds. 
     * The image is scaled down to the width and height you provide. 
     * If an image is detected with a free standing object 
     * it will add more background space where necessary or crop the unimportant parts. 
     * This feature is new and we’d love to hear your feedback!
     * @param {Number} width
     * @param {Number} height
     * @returns {Stream} stream
     */
    thumb(width, height) {
      return this.resize('thumb', width, height);
    },
    /**
     * preserve
     * You can now download the compressed version of 
     * the image with the copyright information and creation date. 
     * @param {*} preserve 
     * @returns {Stream} stream
     */
    preserve(preserve) {
      return post(url, headers, {
        preserve
      });
    }
  };
};

/**
 * https://tinypng.com/developers/reference
 * @param {String} apikey
 */
const tinypng = ({ key, api = 'https://api.tinify.com/shrink' }) => {
  assert.equal(typeof key, 'string');
  assert.equal(typeof api, 'string');
  /**
   * Authentication to the API is done with HTTP Basic Auth. 
   * All requests require an Authorization header that contains a 
   * Base64 digest of the authentication string api:YOUR_API_KEY where 
   * YOUR_API_KEY is the key that can be found on your API account page.
   */
  const headers = {
    Authorization: 'Basic ' + base64(`api:${key}`)
  };
  /**
   * @param {*} input
   */
  return input => {
    assert.ok(input, '"input" is required');
    if (typeof input === 'string') {
      /**
       * remote file
       * You can also provide a URL to your image instead of having to upload it. 
       * The API accepts a JSON body with the image URL as a source location.
       */
      if (input.startsWith('http')) {
        input = {
          source: {
            url: input
          }
        };
      } else {
        // local file
        input = fs.createReadStream(input);
      }
    }
    return Promise
      .resolve()
      .then(() => post(api, headers, input))
      .then(readStream)
      .then(JSON.parse)
      .then(handleError)
      .then(response => {
        const { output } = response;
        return processor(key, output.url);
      });
  };
};

tinypng.processor = processor;

module.exports = tinypng;