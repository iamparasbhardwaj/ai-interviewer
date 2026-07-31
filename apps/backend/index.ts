import express from "express";
import { PreInterviewBody } from "./types";
import { scrapeGitHub } from "./src/scrapers/github"
import { prisma } from "./db";
import cors from "cors";
import { initSideBand } from "./src/external/sideband";
import { transcript } from "./src/controllers/transcript";

const app = express();
app.use(express.json());
app.use(cors());
// Parse raw SDP payloads posted from the browser
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2.1-mini",
    audio: { output: { voice: "marin" } },
});

app.post("/api/v1/pre-interview", async (req, res) => {
    console.log(req.body);
    const { success, data } = PreInterviewBody.safeParse(req.body);
    if (!success) {
        res.status(422).json({
            message: "Incorrect Body."
        })
        return;
    }


    // TODO - URL Can be malformed, probably use an SLM here.
    const githubUrl = data.github.endsWith("/") ? data.github.slice(0, -1) : data.github;
    //const linkedInUrl = data.linkedin.endsWith("/") ? data.linkedin.slice(0,-1) : data.linkedin;

    const githubUsername = githubUrl.split("/").pop();

    // Scrape linked by urself -> PLAY RIGHT + PROXY (DATA IMPULSE ) + DUMMY USERS
    //const linkedUsername = linkedInUrl.split("/").pop();

    const userRepos = await scrapeGitHub(githubUsername!);

    const interview = await prisma.interview.create({
        data: {
            githubMetadata: JSON.stringify(userRepos),
            status: "Pre",
            score: 0
        }
    });

    res.json({ id: interview.id });


});

// An endpoint which creates a Realtime API session.
app.post("/api/v1/session/:interviewId", async (req, res) => {
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
});

app.listen(3001);
console.log("App running on port 3001");


// index.ts - Basic WebSocket echo server with Bun
// Bun.serve() handles both HTTP and WebSocket connections in a single function

const server = Bun.serve({
    port: 8080,

    // Handle regular HTTP requests
    fetch(request, server) {
        const url = new URL(request.url);

        // Upgrade HTTP connection to WebSocket when client requests it
        if (url.pathname === "/transcript") {
            const upgraded = server.upgrade(request);
            if (upgraded) {
                // Connection successfully upgraded to WebSocket
                return undefined;
            }
            return new Response("WebSocket upgrade failed", { status: 400 });
        }
        return new Response("Not found", { status: 404 });
    },

    // WebSocket event handlers
    websocket: transcript
});

console.log(`WebSocket server running at http://localhost:${server.port}`);