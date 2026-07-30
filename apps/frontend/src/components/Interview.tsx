import { useEffect } from "react";
import { useParams } from "react-router"
import { useRef } from "react"
import { BACKEND_URL,BACKEND_WS_URL } from "@/lib/configs";

export function Interview() {
    const { interviewId } = useParams();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        (
            async () => {
                // Create a peer connection
                const pc = new RTCPeerConnection();
                console.log("Starting Connection");
                // Set up to play remote audio from the model
                audioRef.current = document.createElement("audio");
                audioRef.current.autoplay = true;
                pc.ontrack = (e) => (audioRef.current!.srcObject = e.streams[0]!);

                // Add local audio track for microphone input in the browser
                const ms = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                pc.addTrack(ms.getTracks()[0]!);

                const socket = new WebSocket(`${BACKEND_WS_URL}/transcript`,[
                    `${interviewId}`
                ]);

                socket.onopen = () => {
                    const mediaRecorder = new MediaRecorder(ms,{mimeType: 'audio/webm'});
                    mediaRecorder.start(250);
                    console.log(mediaRecorder.state); // want "recording"
                    mediaRecorder.onerror = (e) => console.error('recorder error', e);
                    mediaRecorder.addEventListener('dataavailable',(event) => {
                        socket.send(event.data);
                    })
                }

                socket.onmessage = (message) => {
                    const recieved = JSON.parse(message.data);
                    const transcript = recieved.channel?.alternatives[0].transcript;
                    if(transcript){
                        console.log(transcript);
                    }
                };

                // Set up data channel for sending and receiving events
                const dc = pc.createDataChannel("oai-events");

                // Start the session using the Session Description Protocol (SDP)
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // const sdpResponse = await fetch(`${BACKEND_URL}/api/v1/session/${interviewId}`, {
                //     method: "POST",
                //     body: offer.sdp,
                //     headers: {
                //         "Content-Type": "application/sdp",
                //     },
                // });
                // console.log(" SDP Recieved");
                // const answer = {
                //     type: "answer" as "answer",
                //     sdp: await sdpResponse.text(),
                // };
                
                // await pc.setRemoteDescription(answer);
                console.log(" Connection Established");
            }
        )()
    }, []);
    return <div>
        <h1>Interview</h1>
        <audio autoPlay ref={audioRef}></audio>
    </div>
}