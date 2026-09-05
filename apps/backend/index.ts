import { createHttpApp, HTTP_PORT } from "./src/config/httpConfig";
import { apiRouter } from "./src/routes/restApi";
import { createWsServer } from "./src/config/wsConfig";

const app = createHttpApp();

app.use("/api", apiRouter);

app.listen(HTTP_PORT);
console.log(`App running on port ${HTTP_PORT}`);

const wsServer = createWsServer();
console.log(`WebSocket server running at http://localhost:${wsServer.port}`);
