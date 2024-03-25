import type { Express } from "express";

import { networkInterfaces } from "os";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";

/**
 * Setup the server

 */
export function setupServer(app: Express, port: number) {
  // setup
  const ipAddress = Object.values(networkInterfaces())
    .flat()
    .find((iface) => iface?.family === "IPv4" && !iface.internal)?.address;

  let serverAddress = `${ipAddress}:${port}`;

  let server:
    | https.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
    | http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

  if (process.argv.includes("--ssl")) {
    const options = {
      key: fs.readFileSync(path.join(__dirname, "../certs", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "../certs", "cert.pem")),
    };
    server = https.createServer(options, app);
    serverAddress = `https://${serverAddress}`;
  } else {
    server = http.createServer(app);
    serverAddress = `http://${serverAddress}`;
  }

  const start = () =>
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is running at: ${serverAddress}`);
    });

  return { server, start };
}
