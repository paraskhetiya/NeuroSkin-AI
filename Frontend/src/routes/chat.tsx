import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { UploadZone } from "@/components/chat/UploadZone";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SymptomChecklist } from "@/components/chat/SymptomChecklist";
import { ProcessingIndicator } from "@/components/chat/ProcessingIndicator";
import {
  type AnalysisPhase,
  type ChatMessage,
  type CnnPrediction,
  type FinalDiagnosis,
  type ApiSymptomMap,
} from "@/components/chat/types";
import { Send, Home } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Skin Analysis — NeuroSkin AI" },
      { name: "description", content: "Upload a photo and chat with NeuroSkin AI." },
    ],
  }),
  component: ChatPage,
});

let idCounter = 0;
const newId = () => `m${++idCounter}-${Date.now()}`;

const API_BASE = "/api";

/**
 * POST /api/analyze — Upload image, run dual CNN, get top-3 + symptoms.
 */
async function fetchAnalysis(file: File): Promise<{
  predictions: CnnPrediction[];
  symptoms: ApiSymptomMap;
}> {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_BASE}/analyze`, { method: "POST", body: fd });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Analysis failed (${res.status}): ${detail}`);
  }
  return res.json();
}

/**
 * POST /api/diagnose — Send predictions + symptoms to LLM, get final diagnosis.
 */
async function fetchDiagnosis(
  predictions: CnnPrediction[],
  selectedSymptoms: string[],
): Promise<Omit<FinalDiagnosis, "heatmapUrl" | "originalUrl">> {
  const res = await fetch(`${API_BASE}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      predictions,
      selected_symptoms: selectedSymptoms,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Diagnosis failed (${res.status}): ${detail}`);
  }
  return res.json();
}

/**
 * POST /api/gradcam — Generate Grad-CAM heatmap overlay.
 * Returns a base64 PNG data URI or null if the backend fails.
 */
async function fetchGradCam(file: File, className: string): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("class_name", className);

    const res = await fetch(`${API_BASE}/gradcam`, { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = (await res.json()) as { heatmap?: string };
    if (!data.heatmap) return null;
    // backend returns base64 (with or without data: prefix)
    return data.heatmap.startsWith("data:")
      ? data.heatmap
      : `data:image/png;base64,${data.heatmap}`;
  } catch {
    return null;
  }
}

function ChatPage() {
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [symptomMap, setSymptomMap] = useState<ApiSymptomMap>({});
  const [currentPredictions, setCurrentPredictions] = useState<CnnPrediction[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The merged top-3 from both CNNs — drives which symptoms appear in the checklist.
  const top3Merged = useMemo<CnnPrediction[]>(() => {
    const last = [...messages].reverse().find(
      (m) => m.kind === "cnn-top3" && m.cnnModel === "merged",
    );
    return last?.cnnTop3 ?? [];
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  const reset = () => {
    setMessages([]);
    setPhase("idle");
    setPendingFile(null);
    setSymptomMap({});
    setCurrentPredictions([]);
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    setPendingPhotoUrl(null);
  };

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPhotoUrl(url);

    setMessages((m) => [
      ...m,
      { id: newId(), role: "user", kind: "image", imageUrl: url, createdAt: Date.now() },
    ]);
    setPhase("cnn-lesion");

    try {
      // Brief pause to show "Lesion model running" indicator
      await new Promise((r) => setTimeout(r, 800));
      setPhase("cnn-skin");

      // Call the real backend
      const { predictions, symptoms } = await fetchAnalysis(file);

      // Store for later use in diagnosis
      setCurrentPredictions(predictions);
      setSymptomMap(symptoms);

      // Normalise confidences for display (API returns 0–100, CnnTop3Card expects 0–1)
      const normalised: CnnPrediction[] = predictions.map((p) => ({
        ...p,
        confidence: p.confidence / 100,
      }));

      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          kind: "cnn-top3",
          cnnTop3: normalised,
          cnnModel: "merged",
          createdAt: Date.now(),
        },
        {
          id: newId(),
          role: "assistant",
          kind: "text",
          content:
            "Based on the combined analysis from both lesion and skin disease models, here are the top 3 most likely conditions. Please tick every symptom you currently have so I can pick the most accurate one.",
          createdAt: Date.now(),
        },
      ]);
      setPhase("questioning");
    } catch (err) {
      console.error("[NeuroSkin] Analysis error:", err);
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          kind: "text",
          content: `⚠️ Something went wrong during image analysis: ${err instanceof Error ? err.message : "Unknown error"}. Please make sure the backend server is running (uvicorn backend.main:app) and try again.`,
          createdAt: Date.now(),
        },
      ]);
      setPhase("idle");
    }
  };

  const handleSymptoms = async (selected: string[]) => {
    // User submits the whole symptom checklist as one message
    const summary =
      selected.length === 0
        ? "I don't have any of these symptoms."
        : `My symptoms: ${selected.join(" · ")}`;

    setMessages((m) => [
      ...m,
      {
        id: newId(),
        role: "user",
        kind: "text",
        content: summary,
        createdAt: Date.now(),
      },
    ]);

    // → LLM thinking → Grad-CAM → final
    setPhase("llm-thinking");
    setMessages((m) => [
      ...m,
      {
        id: newId(),
        role: "assistant",
        kind: "thinking",
        thinkingLabel: "Fusing image + symptoms",
        createdAt: Date.now(),
      },
    ]);

    try {
      // 1. Call /api/diagnose for the final diagnosis
      const diagnosisResult = await fetchDiagnosis(currentPredictions, selected);

      // 2. Now generate Grad-CAM
      setPhase("gradcam");
      setMessages((m) =>
        m.map((msg) =>
          msg.kind === "thinking"
            ? { ...msg, thinkingLabel: "Highlighting affected region" }
            : msg,
        ),
      );

      // Use the top predicted class name for Grad-CAM
      const topClassName = currentPredictions[0]?.id ?? "acne";
      const heatmap = pendingFile ? await fetchGradCam(pendingFile, topClassName) : null;

      const final: FinalDiagnosis = {
        ...diagnosisResult,
        originalUrl: pendingPhotoUrl ?? "",
        heatmapUrl: heatmap,
      };

      setMessages((m) => [
        ...m.filter((msg) => msg.kind !== "thinking"),
        {
          id: newId(),
          role: "assistant",
          kind: "final",
          finalDiagnosis: final,
          createdAt: Date.now(),
        },
      ]);
      setPhase("final");
    } catch (err) {
      console.error("[NeuroSkin] Diagnosis error:", err);
      // Remove thinking indicator
      setMessages((m) => [
        ...m.filter((msg) => msg.kind !== "thinking"),
        {
          id: newId(),
          role: "assistant",
          kind: "text",
          content: `⚠️ Diagnosis failed: ${err instanceof Error ? err.message : "Unknown error"}. Please make sure the backend server is running and try again.`,
          createdAt: Date.now(),
        },
      ]);
      setPhase("final");
    }
  };

  const phaseLabel: Record<AnalysisPhase, string> = {
    idle: "Awaiting photo upload",
    uploading: "Uploading photo…",
    "cnn-lesion": "Lesion model running…",
    "cnn-skin": "Skin disease model running…",
    questioning: "Tick the symptoms that apply",
    "llm-thinking": "AI reasoning over your case…",
    gradcam: "Generating Grad-CAM overlay…",
    final: "Analysis complete",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar onNew={reset} />

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold">Skin Analysis Session</h1>
            <p className="truncate text-xs text-muted-foreground">{phaseLabel[phase]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-bio/30 bg-bio/10 px-3 py-1 text-xs text-bio sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-bio" />
              AI Powered
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            {messages.length === 0 && phase === "idle" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Hi, I'm <span className="text-gradient-brand">NeuroSkin</span>.
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Upload a clear photo of the affected area to begin.
                  </p>
                </div>
                <UploadZone onFile={handleFile} />
              </div>
            )}

            <div className="space-y-6">
              {messages.map((m) =>
                m.kind === "thinking" ? (
                  <div key={m.id} className="ml-11">
                    <ProcessingIndicator
                      phase={phase === "gradcam" ? "gradcam" : "llm-thinking"}
                      label={m.thinkingLabel}
                    />
                  </div>
                ) : (
                  <MessageBubble key={m.id} msg={m} />
                ),
              )}

              {(phase === "cnn-lesion" || phase === "cnn-skin") && (
                <div className="ml-11">
                  <ProcessingIndicator
                    phase="cnn-running"
                    label={
                      phase === "cnn-lesion"
                        ? "Lesion model — analyzing pigmentation & borders"
                        : "Skin disease model — analyzing texture & pattern"
                    }
                  />
                </div>
              )}

              <AnimatePresence mode="wait">
                {phase === "questioning" && top3Merged.length > 0 && (
                  <div className="ml-11">
                    <SymptomChecklist
                      top3={top3Merged}
                      symptomMap={symptomMap}
                      onSubmit={handleSymptoms}
                    />
                  </div>
                )}
              </AnimatePresence>

              {phase === "final" && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={reset}
                    className="rounded-xl bg-gradient-to-r from-cyan to-bio px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
                  >
                    Start a new analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-background/50 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="glass flex flex-1 items-center gap-2 rounded-2xl px-4 py-3">
              <input
                disabled={phase !== "idle" && phase !== "final"}
                placeholder={
                  phase === "questioning"
                    ? "Please answer the question above…"
                    : "Describe symptoms or upload a new photo…"
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
              />
            </div>
            <button
              disabled
              className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-bio text-background opacity-60"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground/60">
            NeuroSkin AI provides educational guidance only. Always consult a licensed dermatologist for medical decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
