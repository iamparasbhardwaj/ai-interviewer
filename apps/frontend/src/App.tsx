import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import "../styles/globals.css";
import { useState } from "react";
import { Toaster } from "sonner";

export function App() {
  const [page , setPage ] = useState<"form" | "interview" | "result">("form");
  // Use React router this is quick lazy workaround for now.
  return (
    <div>
      {page === "form" && <Form/>}
      {page === "interview" && <Interview/>}
      {page === "result" && <Result/>}
      <Toaster position="bottom-left"/>
    </div>
  );
}

export default App;
