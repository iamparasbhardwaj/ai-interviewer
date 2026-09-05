import { transcript } from "../controllers/transcript";
import { handleWsUpgrade } from "../routes/webSocket";

export const WS_PORT = 8080;

export function createWsServer() {
    return Bun.serve({
        port: WS_PORT,
        fetch: handleWsUpgrade,
        websocket: transcript,
    });
}
