import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import "../styles/globals.css";
import { useState } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";

export function App() {
  const [page, setPage] = useState<"form" | "interview" | "result">("form");
  // Use React router this is quick lazy workaround for now.
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/interview/:id" element={<Interview />} />
        <Route path="/result" element={<Result />} />
      </Routes>
      <Toaster position="bottom-left" />
    </BrowserRouter>
  );
}

export default App;
