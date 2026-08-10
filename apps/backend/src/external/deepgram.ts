const DEEPGRAM_API_KEY = process.env.DEEPGRAM_TOKEN;

const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_PENDING_CHUNKS = 40; // ~10s of audio at 250ms timeslices

export class InterviewAudioSession {
    private ws: WebSocket | null = null;
    private interviewId: string;
    private sampleRate: number;
    private isOpen = false;
    private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
    private intentionalClose = false;
    private reconnectAttempts = 0;
    private pendingChunks: (string | Buffer)[] = [];

    constructor(interviewId: string, sampleRate: number) {
        this.interviewId = interviewId;
        this.sampleRate = sampleRate;
    }

    public async initializeDeepgram() {
        const params = new URLSearchParams({
            model: "nova-2",
            language: "en-US",
            smart_format: "true",
            encoding: "linear16",
            sample_rate: String(this.sampleRate),
            channels: "1",
        });

        this.ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, {
            "protocols": [
                'token', DEEPGRAM_API_KEY,
            ]
        } as any); // Bun supports headers here; TS lib.dom types don't know that

        this.ws.binaryType = "arraybuffer";

        this.ws.addEventListener("open", () => {
            this.isOpen = true;
            this.reconnectAttempts = 0;
            console.log("Connected deepgram");

            for (const chunk of this.pendingChunks) {
                this.ws!.send(chunk as any);
            }
            this.pendingChunks = [];

            // Deepgram closes idle sockets after ~12s without data
            this.keepAliveTimer = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: "KeepAlive" }));
                }
            }, 2000);
        });

        this.ws.addEventListener("close", (event) => {
            this.isOpen = false;
            if (this.keepAliveTimer) {
                clearInterval(this.keepAliveTimer);
                this.keepAliveTimer = null;
            }
            console.log("Deepgram closed:", event.code, event.reason);

            if (this.intentionalClose) return;

            if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.error("Deepgram reconnect attempts exhausted, giving up");
                return;
            }
            this.reconnectAttempts++;
            const delay = Math.min(1000 * 2 ** (this.reconnectAttempts - 1), 8000);
            console.log(`Reconnecting to Deepgram in ${delay}ms (attempt ${this.reconnectAttempts})`);
            setTimeout(() => {
                if (!this.intentionalClose) this.initializeDeepgram();
            }, delay);
        });

        this.ws.addEventListener("message", (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data as string);
                if (data.type === "Results") {
                    const transcript = data.channel?.alternatives?.[0]?.transcript;
                    if (transcript) {
                        console.log(transcript);
                        if (data.is_final) {
                            this.save(this.interviewId, transcript);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to parse Deepgram message:", err);
            }
        });

        this.ws.addEventListener("error", (err: Event) => {
            console.error(err);
        });
    }

    // Pass the buffer received from this user's specific backend socket
    public receiveAudioChunk(chunk: string | Buffer) {
        if (this.ws && this.isOpen && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(chunk as any);
            return;
        }
        // Deepgram connection isn't open yet (initial handshake or a reconnect
        // in progress) — buffer rather than silently drop audio.
        this.pendingChunks.push(chunk);
        if (this.pendingChunks.length > MAX_PENDING_CHUNKS) {
            this.pendingChunks.shift();
        }
    }

    private save(userId: string, text: string) {
        console.log(`Relaying to User [${userId}]: ${text}`);
        // TODO: Send this back over your client's WebSocket connection (Socket.io, WS, etc.)
    }

    public close() {
        this.intentionalClose = true;
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: "CloseStream" }));
            }
            this.ws.close();
            this.ws = null;
        }
    }
}