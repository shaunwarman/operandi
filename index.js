const OS = require('os');
const V8 = require('v8');

const Publisher = require('./lib/publisher');

const {EventEmitter} = require('events');

const defaults = {
  name: 'ops-event',
  http: false,
  interval: 1000,
  osevents: [
    'freemem',
    'loadavg',
    'totalmem',
    'uptime'
  ],
  v8events: true,
  buffer_size: 1
};

class Ops extends EventEmitter {
  constructor(options = {}) {
    super();

    this.buffer = [];
    this.intervalId = null;
    this.started = false;

    this.buffer_size = options.buffer_size || defaults.buffer_size;
    this.interval = options.interval || defaults.interval;
    this.name = options.name || defaults.name;
    this.osevents = options.osevents || defaults.osevents;
    this.v8events = options.v8events || defaults.v8events;

    this.publisher = new Publisher();

    this.on('start', () => {
      this.started = true;

      this.intervalId = setInterval(() => {
        this._write(this._metrics());
      }, this.interval);
    });

    this.on('stop', () => {
      clearInterval(this.intervalId);

      this._flush(() => {
        process.exit(0);
      })
    });
  }

  start() {
    if (!this.started) {
      this.emit('start');
    }
  }

  stop() {
    this.emit('stop');
  }

  _metrics() {
    let events = {};

    this.osevents.forEach(event => {
      events[event] = OS[event]();
    });

    if (this.v8events) {
      const v8 = V8.getHeapStatistics();
      return Object.assign(events, v8);
    }

    return events;
  }

  _write(metrics) {
    this.publisher.write(metrics, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(res);
    });
  }

  _flush(callback) {
    this.buffer = [];

    callback();
  }
}

module.exports = Ops;
