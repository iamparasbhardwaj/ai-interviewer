import express from "express";
import { PreInterviewBody } from "./types";
import {prisma} from "./db";

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


    // TODO - URL Can be malformed, probably use an SLM here.
    const githubUrl = data.github.endsWith("/") ? data.github.slice(0,-1) : data.github;
    const linkedInUrl = data.linkedin.endsWith("/") ? data.linkedin.slice(0,-1) : data.linkedin;

    const githubUsername = githubUrl.split("/").pop();

    // Scrape linked by urself -> PLAY RIGHT + PROXY (DATA IMPULSE ) + DUMMY USERS
    const linkedUsername = linkedInUrl.split("/").pop();


    // USE PROXY LIKE DATA IMPULSE TO DO THIS TO AVOID GETTING RATE LIMITED.
    const repos = await axios.get(`https://api.github.com/users/${githubUsername}/repos`);
    
    const filteredUserRepos = userRepos.data.map((x : any) => ({
        description : x.description,
        name : x.name,
        fullName : x.full_name,
        starCount : x.stargazers_count
    }));

    console.log(filteredUserRepos);

});

app.listen(3001);
console.log("App running on port 3001");