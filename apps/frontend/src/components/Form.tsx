import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { ThinkingOrb } from "thinking-orbs";
import { BACKEND_URL } from "@/lib/configs";
import { cn } from "@/lib/utils";
import { Nav } from "./home/Nav";
import { AmbientField } from "./home/AmbientField";
import { Orb } from "./home/Orb";
import { Eyebrow } from "./home/Eyebrow";

type Mode = "file" | "text";
type Errors = { resume?: string; summary?: string };

const MAX_FILE_BYTES = 3.5 * 1024 * 1024;
const MAX_FILE_LABEL = "3MB";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Mode switch: two ghost tabs sharing the nav-link underline treatment, so
 * choosing between a PDF and a pasted summary reads as the same affordance
 * as the site's nav rather than a new control.
 */
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="flex gap-[30px]">
      {(
        [
          ["file", "Upload PDF"],
          ["text", "Paste summary"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "pi-navlink pb-[8px] font-ppneuemontreal text-nav-label font-semibold tracking-[0.35px] uppercase transition-colors",
            mode === value ? "text-bone-white" : "text-ash-gray hover:text-bone-white",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Resume dropzone. Same hairline-rule language as a text field, just boxed
 * on all four sides (dashed, so it still reads as an opening rather than a
 * filled card) since a single bottom rule doesn't give a drop target enough
 * room to land in.
 */
function ResumeDropzone({
  file,
  error,
  onFileSelected,
}: {
  file: File | null;
  error?: string;
  onFileSelected: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col gap-[8px]">
      <label
        htmlFor="resume"
        className="font-ppneuemontreal text-nav-label font-semibold tracking-[0.35px] text-ash-gray uppercase"
      >
        Resume
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onFileSelected(e.dataTransfer.files?.[0] ?? null);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "resume-error" : undefined}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-[12px] border border-dashed px-[16px] py-[14px] outline-none transition-colors",
          error
            ? "border-bone-white"
            : isDragging
              ? "border-bone-white/70"
              : "border-bone-white/20 hover:border-bone-white/40",
        )}
      >
        <span className="truncate font-ppneuemontreal text-body font-extralight text-bone-white">
          {file ? file.name : "Drop your resume here, or click to browse"}
        </span>
        {file ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelected(null);
            }}
            className="shrink-0 font-ppneuemontreal text-caption text-ash-gray transition-colors hover:text-bone-white"
          >
            Remove
          </button>
        ) : (
          <span className="shrink-0 font-ppneuemontreal text-caption text-ash-gray">PDF, up to {MAX_FILE_LABEL}</span>
        )}
      </div>
      <input
        ref={inputRef}
        id="resume"
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
      />
      {error && (
        <p id="resume-error" className="font-ppneuemontreal text-caption text-bone-white">
          {error}
        </p>
      )}
    </div>
  );
}

function SummaryField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label
        htmlFor="summary"
        className="font-ppneuemontreal text-nav-label font-semibold tracking-[0.35px] text-ash-gray uppercase"
      >
        Text summary
      </label>
      <textarea
        id="summary"
        rows={7}
        spellCheck={false}
        placeholder="Paste a short summary of your experience, skills, and the projects you've shipped."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "summary-error" : undefined}
        className={cn(
          "w-full resize-none bg-transparent px-[16px] py-[14px] font-ppneuemontreal text-body font-extralight text-bone-white",
          "border outline-none transition-colors placeholder:text-ash-gray/60",
          error ? "border-bone-white" : "border-bone-white/20 focus:border-bone-white/70",
        )}
      />
      {error && (
        <p id="summary-error" className="font-ppneuemontreal text-caption text-bone-white">
          {error}
        </p>
      )}
    </div>
  );
}

export function Form() {
  const [mode, setMode] = useState<Mode>("file");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleFileSelected(file: File | null) {
    setResumeFile(file);
    setSubmitError(null);
    if (!file) {
      setErrors((prev) => ({ ...prev, resume: undefined }));
      return;
    }
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, resume: "Please upload a PDF file." }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors((prev) => ({ ...prev, resume: `File is too large. Max size is ${MAX_FILE_LABEL}.` }));
      return;
    }
    setErrors((prev) => ({ ...prev, resume: undefined }));
  }

  function handleSummaryChange(value: string) {
    setSummary(value);
    setSubmitError(null);
    setErrors((prev) => ({ ...prev, summary: undefined }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    const nextErrors: Errors = {};
    if (mode === "file") {
      if (!resumeFile) nextErrors.resume = "A resume PDF is required.";
      else if (resumeFile.type !== "application/pdf") nextErrors.resume = "Please upload a PDF file.";
      else if (resumeFile.size > MAX_FILE_BYTES) nextErrors.resume = `File is too large. Max size is ${MAX_FILE_LABEL}.`;
    } else {
      if (!summary.trim()) nextErrors.summary = "A text summary is required.";
    }
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const payload =
        mode === "file" && resumeFile
          ? { resume: { content: await fileToBase64(resumeFile), filename: resumeFile.name } }
          : { summary: summary.trim() };
      const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, payload);
      navigate(`/interview/${response.data.id}`);
    } catch {
      setSubmitError("Couldn't start the interview. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pi-root relative min-h-screen w-full overflow-x-hidden bg-void">
      <AmbientField className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative">
        <Nav minimal />

        <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-[60px] px-[24px] pt-[36px] pb-[120px] sm:px-[36px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-[60px] lg:pt-[60px]">
          <div>
            <div className="pi-fade-up" style={{ animationDelay: "60ms" }}>
              <Eyebrow>Start your interview</Eyebrow>
            </div>

            <h1 className="mt-[18px] max-w-[620px] font-ppneuemontreal text-subheading font-normal text-bone-white sm:text-heading-sm lg:text-heading-lg">
              <span className="pi-line">
                <span style={{ animationDelay: "140ms" }}>One resume.</span>
              </span>
              <span className="pi-line">
                <span style={{ animationDelay: "230ms" }}>One real interview.</span>
              </span>
            </h1>

            <p
              className="pi-fade-up mt-[30px] max-w-[460px] font-ppneuemontreal text-body font-extralight text-silver-mist"
              style={{ animationDelay: "420ms" }}
            >
              Upload your resume as a PDF, or paste a short summary. The interviewer reads it first, then builds its
              questions from what you've actually shipped.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-[36px] flex max-w-[460px] flex-col gap-[24px]">
              <div className="pi-fade-up" style={{ animationDelay: "500ms" }}>
                <ModeToggle
                  mode={mode}
                  onChange={(next) => {
                    setMode(next);
                    setErrors({});
                    setSubmitError(null);
                  }}
                />
              </div>

              <div className="pi-fade-up" style={{ animationDelay: "560ms" }}>
                {mode === "file" ? (
                  <ResumeDropzone file={resumeFile} error={errors.resume} onFileSelected={handleFileSelected} />
                ) : (
                  <SummaryField value={summary} error={errors.summary} onChange={handleSummaryChange} />
                )}
              </div>

              <div className="pi-fade-up flex flex-col gap-[18px]" style={{ animationDelay: "680ms" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "pi-cta inline-flex w-fit items-center justify-center gap-[10px] rounded-full bg-electric-iris",
                    "px-[16px] py-[14.4px] font-ppneuemontreal text-nav-label font-semibold text-bone-white uppercase",
                    "disabled:pointer-events-none disabled:opacity-70",
                  )}
                >
                  {loading ? (
                    <>
                      {/* The library at its inline size, doing the job it was
                          designed for. Pinned dark: light ink reads on violet. */}
                      <ThinkingOrb state="working" size={20} theme="dark" aria-label="" />
                      Starting interview
                    </>
                  ) : (
                    "Start interview"
                  )}
                </button>

                {submitError && (
                  <p role="alert" className="font-ppneuemontreal text-caption text-bone-white">
                    {submitError}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="relative flex h-[300px] w-full items-center justify-center sm:h-[400px] lg:h-[520px]">
            {/* `searching` — a scan meridian sweeping a dotted globe, which is
                literally what happens next: we read the resume. */}
            <Orb className="max-h-full" state="searching" />
          </div>
        </section>
      </div>
    </div>
  );
}
