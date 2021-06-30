// const express = require('express')
// const app = express()

// app.get('/', (req,res) => {
//   res.send('Hello World')
// })

// app.get('/health',(req,res) => {
//   res.send('I')
// })

// app.listen(8080,() => {
//   console.log("Server up and running")
// })

      /* marche mais pas socket
         // var express = require('express');
         // var app = express();
         // const http = require('http').Server(app);
         // http.listen(8080);
         // const io = require('socket.io')(http);
      fin marche mais pas socket */

// const bodyParser = require('body-parser')

// const server = require('http').Server(app)
      // var server = app.listen(8080);
      // var http = require('http');
      // var server = http.createServer(app);
    
      // server.listen(8080);
      // var io = require('socket.io')(server);
      
   //  var io = require('socket.io')(server);
   //  io.listen(8080);

// // ajout de socket.io

// var server = app.listen(8810)
// var io = require('socket.io').listen(server);

var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io')(server);

// server.listen(8080);


// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
   res.sendFile('./index.html', { root: __dirname })
})

app.get('/json', function (req, res) {
   res.status(200).json({"message":"ok"})
})

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

const i2c = require('i2c-bus');

const ADS7830 = 0x4b;
const CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];

// établissement de la connexion
io.on('connection', function (socket) {
            // const i2c1 = i2c.openSync(1);
            // var dataX=1;
            // // var dataY = 1;
         
            // setInterval(() => {       
            //   dataX = (i2c1.readWordSync(ADS7830, CHANNELS[0]) - 5911) / 30;
            // //   dataY = (i2c1.readWordSync(ADS7830, CHANNELS[1]) - 5911) / 60;
            //   console.log('data X', dataX);
            // //   console.log('data Y', dataY);
            
            // //   var obj = {dataX: dataX, dataY: dataY};
            //   socket.emit('Curl', dataX);
            // }, 500);
         
            // i2c1.closeSync();
   // socket.emit('allo', { hello: 'world' });
   // console.log(`Connecté au client ${socket.id}`);
   // // socket.on('action', function () {
   // //    console.log('A user disconnected');
      var xxx = 1000;
      socket.emit('Curl', xxx);
})

// on change app par server
server.listen(8080, '0.0.0.0' ,function () {
 console.log('Votre app est disponible sur localhost:8080 !')
})