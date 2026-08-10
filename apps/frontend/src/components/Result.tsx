import { CircleCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function Result(){
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-sm border-border/60 bg-card/80 text-center shadow-2xl shadow-black/40 backdrop-blur">
                <CardHeader className="items-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <CircleCheck className="size-6" aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-2 text-2xl">Interview Complete</CardTitle>
                    <CardDescription>Your results will appear here shortly.</CardDescription>
                </CardHeader>
                <CardContent />
            </Card>
        </div>
    )
}
