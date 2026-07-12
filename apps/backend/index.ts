import express from "express";
import { PreInterviewBody } from "./types";

const app = express();
app.use(express.json())

app.post("/api/v1/pre-interview",(req,res)=>{
    const {success,data} = PreInterviewBody.safeParse(req.body);
    if(!success){
        res.status(422).json({
            message:"Incorrect Body."
        })
        return;
    }

});

app.listen(3001);
console.log("App running on port 3001");