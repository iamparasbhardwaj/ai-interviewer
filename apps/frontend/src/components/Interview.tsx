import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { BACKEND_URL, BACKEND_WS_URL } from "@/lib/configs";
import { cn } from "@/lib/utils";

// Volume level (0-255 average) above which the remote track counts as "speaking".
const SPEAKING_THRESHOLD = 8;

export function Interview() {
    const navigate = useNavigate();
    const { id: interviewId } = useParams();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [speaking, setSpeaking] = useState(false);

    useEffect(() => {
        if (!interviewId) {
            navigate("/", { replace: true });
            return;
        }

        let cancelled = false;
        let frame: number;
        let audioContext: AudioContext | undefined;
        let micContext: AudioContext | undefined;
        const pc = new RTCPeerConnection();

        (async () => {
            // Set up to play remote audio from the model
            audioRef.current = document.createElement("audio");
            audioRef.current.autoplay = true;

            pc.ontrack = (e) => {
                const stream = e.streams[0]!;
                audioRef.current!.srcObject = stream;

                // Drive the orb animation off the model's actual audio level
                // rather than a manual play/pause signal.
                audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                source.connect(analyser);
                const data = new Uint8Array(analyser.frequencyBinCount);

                let smoothed = 0;
                const tick = () => {
                    analyser.getByteFrequencyData(data as any);
                    const level = data.reduce((a, b) => a + b, 0) / data.length;
                    smoothed = smoothed * 0.8 + level * 0.2;
                    setSpeaking(smoothed > SPEAKING_THRESHOLD);
                    frame = requestAnimationFrame(tick);
                };
                tick();
            };

            // Add local audio track for microphone input in the browser
            const ms = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            pc.addTrack(ms.getTracks()[0]!);

            // Deepgram's live endpoint needs raw linear16 PCM, not a MediaRecorder
            // WebM/Opus container — container auto-detection over the streaming
            // websocket is unreliable and yields empty transcripts.
            const localMicContext = new AudioContext();
            micContext = localMicContext;
            const sampleRate = localMicContext.sampleRate;
            const socket = new WebSocket(
                `${BACKEND_WS_URL}/transcript?interviewId=${encodeURIComponent(interviewId)}&sampleRate=${sampleRate}`
            );

            socket.onopen = () => {
                const micSource = localMicContext.createMediaStreamSource(ms);
                const processor = localMicContext.createScriptProcessor(4096, 1, 1);
                const silentGain = localMicContext.createGain();
                silentGain.gain.value = 0;

                processor.onaudioprocess = (e) => {
                    if (socket.readyState !== WebSocket.OPEN) return;
                    const input = e.inputBuffer.getChannelData(0);
                    const pcm = new Int16Array(input.length);
                    for (let i = 0; i < input.length; i++) {
                        const sample = Math.max(-1, Math.min(1, input[i]!));
                        pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
                    }
                    socket.send(pcm.buffer);
                };

                micSource.connect(processor);
                // ScriptProcessor only fires onaudioprocess while connected to a
                // destination; route through a silent gain to avoid mic echo.
                processor.connect(silentGain);
                silentGain.connect(localMicContext.destination);
            };

            // Set up data channel for sending and receiving events
            pc.createDataChannel("oai-events");

            // Start the session using the Session Description Protocol (SDP)
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const sdpResponse = await fetch(`${BACKEND_URL}/api/v1/session/${interviewId}`, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    "Content-Type": "application/sdp",
                },
            });
            if (cancelled) return;
            const answer = {
                type: "answer" as const,
                sdp: await sdpResponse.text(),
            };
            await pc.setRemoteDescription(answer);
        })();

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            audioContext?.close();
            micContext?.close();
            pc.close();
        };
    }, [interviewId, navigate]);

    return (
        <div className="orb-stage">
            <div className="flex flex-col gap-2">
                <div className="orb-eyebrow">AI Agent</div>
                <div className="orb-status" aria-live="polite">
                    {speaking ? "Speaking" : "Listening"}
                </div>
            </div>
            <div
                className={cn("orb", speaking && "is-speaking")}
                role="img"
                aria-label={speaking ? "AI agent speaking" : "AI agent listening"}
            />
        </div>
    );
}
