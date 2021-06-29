const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 8080;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

var Gpio = require('onoff').Gpio;
const i2c = require('i2c-bus');

const ADS7830 = 0x4b;
const CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];

// let interval;

// io.on("connection", (socket) => {
//   console.log("New client connected");
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(() => getApiAndEmit(socket), 1000);
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     clearInterval(interval);
//   });
// });

io.on('connection', (socket) => {
  const i2c1 = i2c.openSync(1);
  var dataX = 1;
  var dataY = 1;

  setInterval(() => {       
    dataX = (i2c1.readWordSync(ADS7830, CHANNELS[0]) - 5911) / 30;
    dataY = (i2c1.readWordSync(ADS7830, CHANNELS[1]) - 5911) / 60;
    console.log('data X', dataX);
    console.log('data Y', dataY);
    
    var obj = {dataX: dataX, dataY: dataY};
    socket.emit('Curl', obj);
  }, 500);

  i2c1.closeSync();
});

// const getApiAndEmit = socket => {
//   const response = new Date();
//   // Emitting a new message. Will be consumed by the client
//   socket.emit("FromAPI", response);
// };

server.listen(port, () => console.log(`Listening on port ${port}`));