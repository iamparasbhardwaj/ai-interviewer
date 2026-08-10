import { useState } from "react";
import { LoaderCircle, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { BACKEND_URL } from "@/lib/configs";
import axios from "axios";
import { useNavigate } from "react-router";

type Errors = { linkedIn?: string; github?: string };

export function Form() {

  const [github, setGithub] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const navigate = useNavigate();

  async function onSubmit(){
    const nextErrors: Errors = {};
    if(!linkedIn) nextErrors.linkedIn = "LinkedIn URL is required.";
    if(!github) nextErrors.github = "GitHub URL is required.";
    setErrors(nextErrors);
    if(Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const respone = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`,{
          linkedin:linkedIn,
          github
      })
      navigate(`/interview/${respone.data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm border-border/60 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Mic className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="mt-2 text-2xl">AI Interviewer</CardTitle>
          <CardDescription>Share your profiles to start a live voice interview.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              className="h-11"
              placeholder="https://linkedin.com/in/you"
              value={linkedIn}
              aria-invalid={!!errors.linkedIn}
              onChange={e => setLinkedIn(e.target.value)}
            />
            {errors.linkedIn && <p className="text-xs text-destructive">{errors.linkedIn}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              className="h-11"
              placeholder="https://github.com/you"
              value={github}
              aria-invalid={!!errors.github}
              onChange={e => setGithub(e.target.value)}
            />
            {errors.github && <p className="text-xs text-destructive">{errors.github}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={loading} onClick={onSubmit} className="h-12 w-full rounded-full text-base">
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Starting Interview
              </>
            ) : (
              "Start Interview"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
