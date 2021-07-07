//----serveur-const---
const express = require("express");
const formidable = require('formidable');
const cors = require('cors');
const http = require("http");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();

//----electric-const---
/*const socketIo = require("socket.io");
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const LED = new Gpio(26, 'out'); //use GPIO pin 4 as output
const pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

const i2c = require('i2c-bus');
const ADS7830 = 0x4b;
const CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];*/

app.use(cors());

app.use((req,res, next)=>{
  res.setHeader('Access-Control-Allow-Origin',"*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = http.createServer(app);

/*const io = socketIo(server, {
  cors:{
    origins: ["*"],

  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "*", //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
  }}
});

let interval;

io.on("connection", (socket) => {
  //const i2c1 = i2c.openSync(1);
/!*  let dataX = 1;
  let dataY = 1;*!/
  let lightvalue = 0; //static variable for current status
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  const now = new Date();
  const i2c1 = i2c.openSync(1);
  let dataX = (i2c1.readWordSync(ADS7830, CHANNELS[0]) - 5911) / 30;
  let dataY = (i2c1.readWordSync(ADS7830, CHANNELS[1]) - 5911) / 60;
  console.log('data X', dataX);
  console.log('data Y', dataY);
  let data = {now: now, dataX: dataX, dataY: dataY};
  console.log(data);
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", data);
};*/

server.listen(port, () => console.log(`Listening on port ${port}`));

//upload server
const upload = express();
const fileupload = require("express-fileupload");

upload.use(cors());
upload.use(fileupload());
upload.use(express.static("files"));

upload.post("/local_upload", (req, res) => {
  const newpath = __dirname + "/public/samples/";
  const file = req.files.file;
  const filename = file.name;

  file.mv(`${newpath}${filename}`, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed", code: 200 });
    }
    res.status(200).send({ message: "File Uploaded", code: 200 });
  });
});

upload.listen(5000, () => {
  console.log("Server running successfully on 3000");
});