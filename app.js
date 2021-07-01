const express = require("express");
const cors = require('cors');
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
//const port = 4001;
const index = require("./routes/index");

const app = express();
/*app.options('*', cors())*/
app.use(cors());
/*app.head("/simple-cors", cors(), (req, res) => {
  console.info("HEAD /simple-cors");
  res.sendStatus(204);
});*/
//app.use(index);
app.use((req,res, next)=>{
  res.setHeader('Access-Control-Allow-Origin',"*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = http.createServer(app);

//const io = socketIo(server);

const io = require("socket.io")(server, {
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
  const response = new Date();
  console.log(response);
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));