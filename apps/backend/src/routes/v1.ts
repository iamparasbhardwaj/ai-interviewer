import { Router } from "express";
import { createPreInterview } from "../controllers/preInterview";
import { createSession } from "../controllers/session";

export const v1Router = Router();

v1Router.post("/pre-interview", createPreInterview);
v1Router.post("/session/:interviewId", createSession);
