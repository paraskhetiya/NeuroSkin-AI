export type Role = "user" | "assistant";

export type AnalysisPhase =
  | "idle"
  | "uploading"
  | "cnn-lesion"        // Lesion CNN top-3
  | "cnn-skin"          // Skin disease CNN top-3
  | "questioning"       // hardcoded if/else symptom Q&A
  | "llm-thinking"      // LLM fusing both CNNs + symptoms + web context
  | "gradcam"           // backend Grad-CAM generation
  | "final";

export interface CnnPrediction {
  id: string;
  name: string;
  confidence: number; // 0..100 from API, displayed as 0..1 in CnnTop3Card
}

/** Which of the two CNN models produced a prediction set */
export type CnnModelKind = "lesion" | "skin" | "merged";

export interface SymptomQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface FinalDiagnosis {
  name: string;
  confidence: number;
  description: string;
  medicines: { name: string; usage: string }[];
  care: string[];
  severity: "mild" | "moderate" | "see-doctor";
  /** base64 or URL of grad-cam overlay; null = backend failed, fall back to original */
  heatmapUrl: string | null;
  /** original uploaded image URL */
  originalUrl: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  kind:
    | "text"
    | "image"
    | "cnn-top3"
    | "question"
    | "thinking"
    | "final";
  content?: string;
  imageUrl?: string;
  cnnTop3?: CnnPrediction[];
  /** which model the cnnTop3 came from */
  cnnModel?: CnnModelKind;
  question?: SymptomQuestion;
  thinkingLabel?: string;
  finalDiagnosis?: FinalDiagnosis;
  createdAt: number;
}

/** Symptom map returned by POST /api/analyze — disease_id → list of symptom strings */
export type ApiSymptomMap = Record<string, string[]>;

