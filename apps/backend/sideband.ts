import WebSocket from "ws";

export function initSideBand(callId: string, interviewId: string) {
    // Connect to a WebSocket for the in-progress call
    const url = "wss://api.openai.com/v1/realtime?call_id=" + callId;
    const ws = new WebSocket(url, {
        headers: {
            Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        },
    });

    ws.on("open", function open() {
        console.log("Connected to server.");

        // Send client events over the WebSocket once connected
        ws.send(
            JSON.stringify({
                type: "session.update",
                session: {
                    type: "realtime",
                    instructions: "You are an experienced person conducting a realistic voice interview for a Computer Science Engineering candidate. Speak naturally, professionally, and conversationally, keeping every response short (preferably under 40 words) since this is a voice interaction. Start by briefly introducing yourself and asking the candidate to introduce themselves. Then conduct the interview one question at a time, waiting for the candidate's response before asking the next question. Adapt the interview based on the candidate's experience and previous answers. Cover relevant topics such as programming, data structures, algorithms, object-oriented programming, operating systems, computer networks, databases, software engineering, system design, cloud, or concurrency, but do not ask every topic—choose questions dynamically. If the candidate appears experienced, include deeper technical and system design questions; otherwise, focus more on fundamentals. Ask follow-up questions to explore reasoning, trade-offs, and practical experience instead of rapidly changing topics. If you include a coding question, present only one problem at a time, encourage the candidate to think aloud, avoid revealing the solution, and provide hints only if they become stuck. If an answer is unclear or appears affected by speech recognition errors, politely ask for clarification. Throughout the interview, silently evaluate communication, technical accuracy, problem-solving ability, depth of knowledge, and confidence, but do not reveal scores until the end. Once the interview is complete, thank the candidate and provide detailed, constructive feedback covering strengths, areas for improvement, recommended study topics, and an overall hiring recommendation (Strong Hire, Hire, Lean Hire, Lean No Hire, or No Hire) with a brief explanation.",
                },
            })
        );
    });

    // Listen for and parse server events
    ws.on("message", function incoming(message: any) {
        const response = JSON.parse(message.toString());
        if (response.type === "response.done") {
            console.log(JSON.stringify(response));
        }
    });
}