import express from "express";
import https from "https";
import cors from "cors";
import path from "path";
import fs from "fs";
import { networkInterfaces } from "os";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/log", (req, res) => {
  // payload will come under a 'log' key
  console.log(req.body.log);
  res.sendStatus(200);
});

const ipAddress = Object.values(networkInterfaces())
  .flat()
  .find((iface) => iface?.family === "IPv4" && !iface.internal)?.address;

const serverAddress = `${ipAddress}:${port}`;

console.log(process.argv);
if (process.argv.includes("--ssl")) {
  const options = {
    key: fs.readFileSync(path.join(__dirname, "../certs", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../certs", "cert.pem")),
  };

  const server = https.createServer(options, app);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at: https://${serverAddress}`);
  });
} else {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at: http://${serverAddress}`);
  });
}
