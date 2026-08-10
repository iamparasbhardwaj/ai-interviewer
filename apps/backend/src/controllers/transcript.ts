import type { ServerWebSocket } from "bun";
import type { WSData } from "../types/websocket"
import { InterviewAudioSession } from "../external/deepgram"

export const transcript = {
    async open(ws: ServerWebSocket<WSData>) {
        console.log(`Client connected: ${JSON.stringify(ws.data.interviewId)}`);
        const externalSocket = new InterviewAudioSession(ws.data.interviewId, ws.data.sampleRate);
        await externalSocket.initializeDeepgram();
        ws.data.externalSocket = externalSocket;
    },

    message(ws: ServerWebSocket<WSData>, message: string | Buffer) {
        // raw linear16 PCM chunk from the browser's AudioWorklet/ScriptProcessor
        const externalSocket = ws.data.externalSocket;
        externalSocket?.receiveAudioChunk(message);
    },

    close(ws: ServerWebSocket<WSData>) {
        console.log("Disconnection initiated");
        console.log(`Client disconnected: ${ws.data}`);
        ws.data.externalSocket?.close();
    },

    // error(ws: ServerWebSocket<WSData>, error: Error) {
    //     console.error("Client websocket error:", error);
    // },
};