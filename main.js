const {exec, spawn} = require("child_process");
var http = require("http").createServer(handler);
var fs = require("fs");
var io = require("socket.io")(http);
http.listen(8080);
const Scraper = require("@yimura/scraper").default;
const youtube = new Scraper();
var yt_arr = [];
var playing = 0;

function handler(req, res) {
  fs.readFile(__dirname + "/public/index.html", function(err, data) {
    if (err) {
      res.writeHead(404, {
        "Content-Type" : "text/html",
      });
      return res.end("404 Not Found");
    }
    res.writeHead(200, {
      "Content-Type" : "text/html",
    });
    res.write(data);
    return res.end();
  });
}
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
  youtube.search(arg).then((results) => {
    socket.emit("search0", results.videos[0].title, results.videos[0].thumbnail,
                results.videos[0].link);
    socket.emit("search1", results.videos[1].title, results.videos[1].thumbnail,
                results.videos[1].link);
    socket.emit("search2", results.videos[2].title, results.videos[2].thumbnail,
                results.videos[2].link);
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
