const Express = require('express');
const Ops = require('operandi-test');

const ops = new Ops({ host: 'influxdb' });

const app = Express();

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(8000, () => {
  ops.start();
  console.log('Listening on 8000 - Ops started');
})
