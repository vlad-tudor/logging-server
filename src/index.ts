import express from "express";
import https from "https";
import cors from "cors";
import path from "path";
import fs from "fs";
import { networkInterfaces } from "os";
import { v4 } from "uuid";
import type { LogRequestBody, UIDPayload } from "./types";

const app = express();
const port = 8080;

let loggingCache: Record<string, any> = {};

app.use(cors());
app.use(express.json());

// give an example of how to pass the  required query aprams to the url
// http://localhost:8080/?home=https://www.google.com
app.get("/", (req, res) => {
  // get redirect url from query params
  const redirectUrl = req.query.home;

  // send an html page with an a tag that redirects to the redirect url
  res.send(`
      <html>
        <head>
          <script>
            window.location.href = "${redirectUrl || "https://www.google.com"}";
          </script>
        </head>
        <body>
          <a href="${
            redirectUrl || "https://www.google.com"
          }">Click here to redirect</a>
        </body>
      </html>
    `);
});

function printProgress(progress: any) {
  const string = JSON.stringify(progress);
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(string);
}

app.post("/api/uid", (req, res) => {
  const newUUID = v4();
  loggingCache[newUUID] = {};
  const response: UIDPayload = { UID: newUUID };
  res.send(response);
});

app.post("/api/log", (req, res) => {
  // payload will come under a 'log' key
  const { UID, log }: LogRequestBody = req.body;
  if (!UID) {
    return res.status(400).send("uid is required");
  }
  loggingCache[UID] = { ...loggingCache[UID], ...log };

  printProgress(loggingCache[UID]);
  res.sendStatus(200);
});

// setup
const ipAddress = Object.values(networkInterfaces())
  .flat()
  .find((iface) => iface?.family === "IPv4" && !iface.internal)?.address;

const serverAddress = `${ipAddress}:${port}`;

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
