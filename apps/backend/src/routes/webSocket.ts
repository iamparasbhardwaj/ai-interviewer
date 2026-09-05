import type { Server } from "bun";
import type { WSData } from "../types/websocket";

// Upgrades a plain HTTP request to a WebSocket connection when its path
// matches a known route. Mirrors the REST router in shape: one function per
// concern, mounted onto the Bun server in wsConfig.
export function handleWsUpgrade(request: Request, server: Server<WSData>) {
    const url = new URL(request.url);

    if (url.pathname === "/transcript") {
        const interviewId = url.searchParams.get("interviewId");
        if (!interviewId) {
            return new Response("Missing interviewId", { status: 400 });
        }
        const sampleRate = Number(url.searchParams.get("sampleRate")) || 48000;
        console.log(`Interview ID is ${interviewId}`);
        const upgraded = server.upgrade(request, {
            data: { interviewId, sampleRate } satisfies WSData,
        });

        if (!upgraded) {
            return new Response("Upgrade failed", { status: 400 });
        }
        return; // upgrade() handles the response
    }
    return new Response("Not found", { status: 404 });
}
