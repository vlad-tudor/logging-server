import WebSocket from "ws";
import { getFullCache, setCache } from "./state";

// Define a structure to hold client metadata
interface ClientMetadata {
  clientType: string;
}

// Create a Map to associate WebSocket instances with their metadata
const clientMetadataMap = new Map<WebSocket, ClientMetadata>();

export function loggingSocket(wss: WebSocket.Server) {
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const parsedMessage = JSON.parse(message.toString());
      const { UID, clientType, ...log } = parsedMessage;

      // get the cache when opening logger
      if (clientType && clientType === "logger") {
        clientMetadataMap.set(ws, { clientType });
        ws.send(JSON.stringify(getFullCache()));
      } else if (clientMetadataMap.get(ws)?.clientType !== "logger") {
        setCache(UID, log);
        // broadcast cache to loggers
        wss.clients.forEach((client) => {
          const socketIsOpen = client.readyState === WebSocket.OPEN;
          const clientIsLogger =
            clientMetadataMap.get(client)?.clientType === "logger";
          if (socketIsOpen && clientIsLogger) {
            client.send(JSON.stringify(getFullCache()));
          }
        });
      }
    });

    ws.on("close", () => {
      // Remove the client's metadata from the map when they disconnect
      clientMetadataMap.delete(ws);
    });
  });
}
