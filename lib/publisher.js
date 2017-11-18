const InfluxClient = require('influx-client');

class Publisher {
  constructor(options = {}) {
    // add optional publishers

    this.publisher = new InfluxClient(options);
  }

  write(data, callback) {
    this.publisher.write(data, callback);
  }
}

module.exports = Publisher;
