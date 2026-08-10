import type { InterviewAudioSession } from "../external/deepgram";

export interface WSData {
    interviewId: string;
    sampleRate: number;
    externalSocket?: InterviewAudioSession | null;
}