import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import { MAX_RESUME_BYTES, PreInterviewBody } from "../../types";
import { prisma } from "../../db";

const UPLOADS_DIR = path.join(import.meta.dir, "..", "..", "uploads");

export async function createPreInterview(req: Request, res: Response) {
    const { success, data } = PreInterviewBody.safeParse(req.body);
    if (!success) {
        res.status(422).json({
            message: "Incorrect Body."
        })
        return;
    }

    let resumeBuffer: Buffer | null = null;
    if (data.resume) {
        if (!data.resume.filename.toLowerCase().endsWith(".pdf")) {
            res.status(422).json({ message: "Resume must be a PDF file." });
            return;
        }
        resumeBuffer = Buffer.from(data.resume.content, "base64");
        if (resumeBuffer.length === 0 || resumeBuffer.length > MAX_RESUME_BYTES) {
            res.status(422).json({ message: "Resume file is invalid or exceeds the 3MB limit." });
            return;
        }
    }

    const interview = await prisma.interview.create({
        data: {
            status: "Pre",
            score: 0
        }
    });

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    const fileType = resumeBuffer ? "Resume" : "Summary";
    const fileName = resumeBuffer ? `resume-${interview.id}.pdf` : `summary-${interview.id}.txt`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    if (resumeBuffer) {
        fs.writeFileSync(filePath, resumeBuffer);
    } else {
        fs.writeFileSync(filePath, data.summary!, "utf-8");
    }

    await prisma.document.create({
        data: {
            filePath: path.join("uploads", fileName),
            fileType,
            interviewId: interview.id,
        },
    });

    res.json({ id: interview.id });
}
