//----serveur-const---
const express = require("express");
//const formidable = require('formidable');
const cors = require('cors');
const http = require("http");
const port = process.env.PORT || 4001;
//const index = require("./routes/index");
const app = express();

//----electric-const---
const socketIo = require("socket.io");
// const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
// const LED = new Gpio(26, 'out'); //use GPIO pin 4 as output
// const pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

const i2c = require('i2c-bus');
const ADS7830 = 0x4b;
const CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];

app.use(cors());

app.use((req,res, next)=>{
  res.setHeader('Access-Control-Allow-Origin',"*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = http.createServer(app);

const io = socketIo(server, {
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
  // let dataX = 1;
  // let dataY = 1;
  let lightvalue = 0; //static variable for current status
  console.log("New client connected");
  console.log("port", port);
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
  // const now = new Date();
  const i2c1 = i2c.openSync(1);
  let dataX = (i2c1.readWordSync(ADS7830, CHANNELS[0]));
  console.log('data X', dataX);
  socket.emit("FromAPI", dataX);
  // let dataY = (i2c1.readWordSync(ADS7830, CHANNELS[1]) - 5911) / 60;
  // console.log('data X', dataX);
  // console.log('data Y', dataY);
  // let data = {now: now, dataX: dataX, dataY: dataY};
  // console.log(data);
  // let dataX = i2c1.readWordSync(ADS7830, CHANNELS[0]);

  // const pigpio = require('pigpio');
  // const Gpio = pigpio.Gpio;

  // const outPin = 17;

  // // const output = new Gpio(outPin, {mode: Gpio.OUTPUT});
  // const output = new Gpio(outPin, {mode: dataX});
  // console.log('data X', output);

  // output.digitalWrite(0);
  // pigpio.waveClear();

  // let waveform = [];

  // for (let x = 0; x < 20; x++) {
  //   if (x % 2 === 1) {
  //     waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: x + 1 });
  //   } else {
  //     waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: x + 1 });
  //   }
  // }

  // pigpio.waveAddGeneric(waveform);

  // let waveId = pigpio.waveCreate();

  // if (waveId >= 0) {
  //   pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
  // }

  // while (pigpio.waveTxBusy()) {}

  // pigpio.waveDelete(waveId)
  // // Emitting a new message. Will be consumed by the client
  
};

server.listen(port, () => console.log(`Listening on port ${port}`));

// //upload server
// const upload = express();
// const fileUpload = require("express-fileupload");
// const fs = require('fs');
// const publicPath = "/public/samples/";
// const newpath = __dirname + publicPath;
// const directoryPath = newpath;

// upload.use(cors());
 //const fileUpload = require("express-fileupload");
// upload.use(fileUpload());
// upload.use(express.static("files"));

// upload.post("/local_upload", (req, res) => {
//   const file = req.files.file;
//   const filename = file.name;

//   file.mv(`${newpath}${filename}`, (err) => {
//     if (err) {
//       res.status(500).send({ message: "File upload failed", code: 200 });
//     }
//     res.status(200).send({ message: "File Uploaded", code: 200 });
//   });
// });

// upload.post("/local_list", (req, res) => {
//     fs.readdir(directoryPath, (err, files) => {
//       //handling error
//       if (err) {
//         res.status(500).send({message: 'Unable to scan directory: ' + err, code: 200});
//         console.log('Unable to scan directory: ' + err);
//       } else {
//         //listing all files using forEach
//         res.writeHead(200, {'Content-Type': 'application/json'});
//         let filesData = [];
//         files.forEach(file => filesData.push('https://localhost:5000' + publicPath + file));
//         res.end(JSON.stringify(filesData));
//       }
//     });
// });


// // upload.get("/sample_list", (req, res) => {
// //   var files = fs.readdirSync('./dirpath', {withFileTypes: true})
// //   .filter(item => !item.isDirectory())
// //   .map(item => item.name);
// //   res.end(JSON.stringify(files));
// //   // console.log("req",req)
// //   // fs.readdir(publicPath, (err, files) => {
// //   //   let filesData = [];
// //   //   files.forEach(file => filesData.push(file))
// //   //   res.end(JSON.stringify(filesData));
// //   //   });
// // });

// upload.listen(5000, () => {
//   console.log("Filesystem running successfully on 5000");
// });

var myRouter = express.Router();
const path = require('path');
const publicPath = path.join(__dirname, '/public/samples/');
// Je vous rappelle notre route (/piscines).  
myRouter.route('/sample_list')
.get(function(req,res){ 
  const fs = require('fs');
  
  
  var files = fs.readdirSync(publicPath, {withFileTypes: true})
  .filter(item => !item.isDirectory())
  .map(item => item.name);
  res.end(JSON.stringify(files));
  res.json(files);
})

myRouter.use(cors());
const fileUpload = require("express-fileupload");
myRouter.use(fileUpload());
myRouter.use(express.static("files"));

myRouter.route('/local_upload')
.post(function(req, res){
  // console.log("file", req.file);
  const file = req.files.file;
  const filename = file.name;

  file.mv(`${publicPath}${filename}`, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed", code: 500 });
    }
    res.status(200).send({ message: "File Uploaded", code: 200 });
  });
});
app.use(myRouter);  
 
// // Démarrer le serveur 
// app.listen(5000, function(){
// 	console.log("Mon serveur fonctionne"); 
// });