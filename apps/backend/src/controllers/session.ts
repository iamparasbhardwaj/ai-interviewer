import type { Request, Response } from "express";
import { initSideBand } from "../external/sideband";

const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2.1-mini",
    audio: { output: { voice: "marin" } },
});

// Creates a Realtime API session.
export async function createSession(req: Request<{ interviewId: string }>, res: Response) {
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    try {
        const r = await fetch("https://api.openai.com/v1/realtime/calls", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "OpenAI-Safety-Identifier": "hashed-user-id",
            },
            body: fd,
        });
        // Send back the SDP we received from the OpenAI REST API
        const sdp = await r.text();
        const location = r.headers.get("Location");
        const callId = location?.split("/").pop()!;
        console.log(callId);
        res.send(sdp);
        initSideBand(callId, req.params.interviewId);
    } catch (error) {
        console.error("Token generation error:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
}
