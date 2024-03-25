import express from "express";
import cors from "cors";
import { v4 } from "uuid";
import type { LogRequestBody, UIDPayload } from "./types";
import WebSocket from "ws";
import { loggingSocket } from "./loggingSocket";
import { setCache } from "./state";
import { setupServer } from "./setupServer";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// move outside, use some templating
// htmx ? <3
app.get("/display", (req, res) => {
  res.send(`
      <html>
        <head>
          <script>
            const socket = new WebSocket("wss://" + window.location.host + "/api/");
            socket.onopen = () => {
              socket.send(JSON.stringify({ clientType: "logger" }));
            };
            socket.onmessage = (event) => {
              document.body.innerHTML = event.data;
            };
          </script>
        </head>
        <body>
          <h1>Displaying logs</h1>
        </body>
      </html>
    `);
});

// TODO: should be a get request
app.get("/uid", (req, res) => {
  const newUUID = v4();
  setCache(newUUID);
  const response: UIDPayload = { UID: newUUID };
  res.send(response);
});

app.post("/log", (req, res) => {
  // payload will come under a 'log' key
  const { UID, log }: LogRequestBody = req.body;
  if (!UID) {
    return res.status(400).send("uid is required");
  }
  setCache(UID, log);
  res.sendStatus(200);
});

const { server, start } = setupServer(app, port);

loggingSocket(new WebSocket.Server({ server }));

start();
