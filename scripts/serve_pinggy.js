const http = require("http");
const fs = require("fs");
const path = require("path");
const net = require("net");
const { Client } = require("ssh2");
const crypto = require("crypto");

const ARTICLES_DIR = "/home/ubuntu/.openclaw/workspace/articles";

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  let filePath = path.join(ARTICLES_DIR, reqPath === "/" ? "index.html" : reqPath);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404 Not Found");
  }

  const ext = path.extname(filePath);
  let contentType = "text/html; charset=utf-8";
  
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Disposition": "attachment; filename=\"" + path.basename(filePath) + "\""
  });
  res.end(fs.readFileSync(filePath));
});

server.listen(8099, "127.0.0.1", () => {
  console.log("Local HTTP server running on http://127.0.0.1:8099");

  const { privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs1", format: "pem" }
  });

  const ssh = new Client();
  ssh.on("ready", () => {
    ssh.forwardIn("0.0.0.0", 0, (err) => {
      if (err) console.error("forwardIn error:", err);
    });
    ssh.shell((err, stream) => {
      if (err) return console.error("shell error:", err);
      stream.on("data", (data) => {
        const txt = data.toString();
        if (txt.includes("http") || txt.includes("pinggy")) {
          console.log("PINGGY URL OUTPUT:\n" + txt);
        }
      });
    });
  });

  ssh.on("error", (err) => {
    console.error("SSH Error:", err.message);
  });

  ssh.connect({
    host: "a.pinggy.io",
    port: 443,
    username: "openclaw",
    privateKey
  });
});
