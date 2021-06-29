const http = require('http').createServer(handler); //require http server, and create server with function handler()
const fs = require('fs'); //require filesystem module

const url = require('url');
const path = require('path');
const querystring = require('querystring');

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:8000",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const LED = new Gpio(26, 'out'); //use GPIO pin 4 as output
const pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

const i2c = require('i2c-bus');

const ADS7830 = 0x4b;
const CHANNELS = [0x84, 0xc4, 0x94, 0xd4, 0xa4, 0xe4, 0xb4, 0xf4];

/*http.createServer (function(req, res) { //create server
    console.log(req.url);
    if(req.url.includes('/scripts/') || req.url.includes('/styles/') ) {
        console.log(req.url + ' : is an upload');
        fs.readFile(__dirname + '/public' + req.url, function(err, data) { //read file index.html in public folder
            //let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
                return res.end("404 Not Found : " + req.url);
            }
            let filePath = path.join(__dirname, "public", req.url);
            let extName = path.extname(filePath);
            let contentType = 'text/html';

            switch (extName) {
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
                default:
                    console.log('ContentType default : ' + req.url);
            }
            res.writeHead(200, {'Content-Type': contentType});
            res.write(data);
            return res.end();
        });
    }
  /!*  if(req.url.includes('//')) {
        console.log(req.url + ' : is an upload');*!/
        fs.readFile(__dirname + '/public' + req.url, function(err, data) { //read file index.html in public folder
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
                return res.end("404 Not Found : " + req.url);
            }
            let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
            let extName = path.extname(filePath);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
        });
/!*    }
    fs.readFile(__dirname + '/public/index.html', function (err, data) {
        //let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
        let filePath = path.join(__dirname, "public", req.url);

        let extName = path.extname(filePath);

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });*!/
}).listen(8080);*/

http.listen(8080); //listen to port 8080
function handler (req, res) { //create server
    fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}


io.sockets.on('connection', function (socket) {// WebSocket Connection
  const i2c1 = i2c.openSync(1);
    let dataX = 1;
    let dataY = 1;
    let lightvalue = 0; //static variable for current status

  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    console.log('V',value);
    socket.emit('light', lightvalue); //send button status to client
  });

  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
    }
  });

  setInterval(() => {       
    dataX = (i2c1.readWordSync(ADS7830, CHANNELS[0]) - 5911) / 30;
    dataY = (i2c1.readWordSync(ADS7830, CHANNELS[1]) - 5911) / 60;
    console.log('data X', dataX);
    console.log('data Y', dataY);

      let obj = {dataX: dataX, dataY: dataY};
      socket.emit('Curl', obj);
  }, 500);

  i2c1.closeSync();
});

//CLOSING PROCESS LEAVE IT
process.on('SIGINT', function () { //on ctrl+c
    LED.writeSync(0); // Turn LED off
    LED.unexport(); // Unexport LED GPIO to free resources
    pushButton.unexport(); // Unexport Button GPIO to free resources
    process.exit(); //exit completely
});
