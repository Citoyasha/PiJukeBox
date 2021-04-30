const express = require("express");

const {exec, spawn} = require("child_process");

const fs = require("fs");

const client = express();

const yt = require("./yt_search.js");

client.use(express.static('client')); //runs all file under ./client

client.use(function (request, response) {
  response.statusCode = 404;
  response.redirect('main.html');
});

const io_client = require("http").createServer(client).listen(8080);

const io = require("socket.io")(io_client);

var yt_arr = [];
var playing = 0;

function play() {
  if (yt_arr.length > 0) {
    console.log(yt_arr);
    const mpv = spawn("cvlc", [ "--play-and-exit", yt_arr[0] ]);
    mpv.on("close", () => {
      console.log("Playing Next!");
      playing = 0;
      yt_arr.shift();
      play();
    });
  }
}
io.on("connection", (socket) => {
  socket.on("message", (data) => {
  console.log(data);
  let cmd = data.substr(0, 2);
  let arg = data.slice(2);
switch(cmd){
case "!s":
  exec("killall -9 vlc");
  playing = 0;
  break;
case "!v":
  exec(`amixer set 'Master' ${arg}%`);
  break;
case "!m":
  if(arg)
  yt.search(arg).then((r) => {
        socket.emit("search0", `${r[0].title} [${r[0].time}]`, r[0].thumbnail, r[0].link);
        socket.emit("search1", `${r[1].title} [${r[1].time}]`, r[1].thumbnail, r[1].link);
        socket.emit("search2", `${r[2].title} [${r[2].time}]`, r[2].thumbnail, r[2].link);
  });
  break;
case "!l":
  yt_arr.push(arg);
  if (playing == "0") {
    play();
    playing = 1;
  }
  break;
default:
  console.log("unknow value");
    }
  });
});

