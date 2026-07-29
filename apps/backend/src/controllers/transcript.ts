import type { ServerWebSocket } from "bun";
import type { WSData } from "../types/websocket"

export const transcriptController = {
    open(ws: ServerWebSocket<WSData>) {
        console.log(`Client connected: ${ws.data.interviewId}`);

        // const externalSocket = connectExternalSocket({
        //     onMessage: (data) => {
        //         // transcript/result coming back — forward to browser
        //         const recieved = JSON.parse(data);
        //         const transcript = recieved.channel?.alternatives[0].transcript;
        //         if(transcript){
        //             console.log(transcript);
        //         }
        //     },
        //     onClose: () => {
        //         console.log("External socket closed, closing client too");
        //         ws.close();
        //     },
        //     onError: (err) => {
        //         console.error("External socket error:", err);
        //     },
        // });

        // ws.data.externalSocket = externalSocket;
    },

    message(ws: ServerWebSocket<WSData>, message: string | Buffer) {
        // raw audio chunk (ArrayBuffer/Blob) from MediaRecorder
        const externalSocket = ws.data.externalSocket;

        if (externalSocket && externalSocket.readyState === WebSocket.OPEN) {
            externalSocket.send(message);
        } else {
            console.warn("External socket not ready — dropping chunk");
        }
    },

    close(ws: ServerWebSocket<WSData>) {
        console.log(`Client disconnected: ${ws.data.interviewId}`);
        ws.data.externalSocket?.close();
    },

    error(ws: Bun.ServerWebSocket, error: Error) {
        console.error("Client websocket error:", error);
    },
};