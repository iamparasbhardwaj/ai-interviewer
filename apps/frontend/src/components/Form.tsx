import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {toast} from "sonner";
import { BACKEND_URL } from "@/lib/configs";
import axios from "axios";

export function Form() {

  const [github, setGithub] = useState("");
  const [linkedIn, setLinkedIn] = useState("");

  async function onSubmit(){
    if(!github || !linkedIn){
      toast("Please provide valid github &/or Linked In urls.")
      return
    }

    await axios.post(`${BACKEND_URL}/api/v1/pre-interview`,{
        linkedIn,
        github
    })
  }

  return <div className="h-screen w-screen flex justify-center items-center">
    <div>
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        AI Interviewer 🥷🏻
      </h1>
      <div className="p-4">
        <Input placeholder="LinkedIn Url" onChange={e => setLinkedIn(e.target.value)} />
      </div>
      <div className="p-4">
        <Input placeholder="Git Url" onChange={e => setGithub(e.target.value)}/>
      </div>
      <div className="p-4 flex justify-center">
        <Button onClick={onSubmit}>Start Interview</Button>
      </div>
    </div>
  </div>
}