import express from "express";
import cors from "cors";

export const HTTP_PORT = 3001;

export function createHttpApp() {
    const app = express();
    // application/json default limit (100kb) is far too small for a base64-encoded
    // resume; 6mb comfortably covers a 3.5MB PDF plus base64/JSON overhead.
    app.use(express.json({ limit: "6mb" }));
    app.use(cors());
    // Parse raw SDP payloads posted from the browser
    app.use(express.text({ type: ["application/sdp", "text/plain"] }));
    return app;
}
