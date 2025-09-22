import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { "Content-Type": "application/json" },
});

export default api;

// Types
export interface SessionCreateResponse {
  session_id: string;
  questions: string[];
}

export interface SessionReplyResponse {
  next_questions: string[];
  status: "in_progress" | "ready_to_finalize";
  reply: string;
}

export interface FinalizeResponse {
  summary: string;
  components: { name: string; desc: string }[];
  db_schema?: string;
  mermaid?: string;
  tech_stack?: string[];
  integration_steps?: string[];
  rationale?: string;
  diagram_url?: string; // make it optional
}

