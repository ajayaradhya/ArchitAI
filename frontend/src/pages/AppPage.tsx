import { useState, useRef, useEffect } from "react";
import type { FC } from "react";
import api from "../api/api";
import type { SessionCreateResponse, SessionReplyResponse, FinalizeResponse } from "../api/api";
import { Box, Container, Paper, Stack, Typography, TextField, Button, CircularProgress } from "@mui/material";

// -------------------------
// AppPage Component
// -------------------------
const AppPage: FC = () => {
  const [prompt, setPrompt] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [conversation, setConversation] = useState<
    { role: "user" | "architai" | "finalDesign"; text?: string; diagram_url?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, typing]);

  // -------------------------
  // Start session
  // -------------------------
  const startSession = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTyping(true);

    try {
      const res = await api.post<SessionCreateResponse>("/session", { prompt });
      setSessionId(res.data.session_id);

      const firstQuestion = res.data.questions[0];
      setConversation([
        { role: "user", text: prompt },
        ...(firstQuestion ? [{ role: "architai", text: firstQuestion }] : []),
        ] as { role: "user" | "architai" | "finalDesign"; text?: string; diagram_url?: string }[]);

      setQuestions(res.data.questions.slice(1));
      setPrompt("");
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  // -------------------------
  // Answer question
  // -------------------------
  const answerQuestion = async (answer: string) => {
    if (!sessionId) return;
    setLoading(true);
    setTyping(true);

    try {
      setConversation((prev) => [...prev, { role: "user", text: answer }]);

      if (questions.length > 0) {
        const nextQ = questions[0];
        setConversation((prev) => [...prev, { role: "architai", text: nextQ }]);
        setQuestions(questions.slice(1));
      } else {
        const res = await api.post<SessionReplyResponse>(`/session/${sessionId}/reply`, { answer });

        if (res.data.next_questions.length > 0) {
          const nextQ = res.data.next_questions[0];
          setConversation((prev) => [...prev, { role: "architai", text: nextQ }]);
          setQuestions(res.data.next_questions.slice(1));
        }

        if (res.data.status === "ready_to_finalize") {
          const finalRes = await api.post<FinalizeResponse>(`/session/${sessionId}/finalize`);
          setConversation((prev) => [
            ...prev,
            { role: "finalDesign", diagram_url: finalRes.data.diagram_url },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to answer question:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const resetSession = () => {
    setPrompt("");
    setSessionId(null);
    setQuestions([]);
    setConversation([]);
    setLoading(false);
    setTyping(false);
  };

  // -------------------------
  // Download diagram
  // -------------------------
  const downloadDiagram = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "system_design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Session Controls */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        {!sessionId && (
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Enter your system design idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startSession(); } }}
          />
        )}
        {!sessionId && (
          <Button variant="contained" color="primary" onClick={startSession} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Start Session"}
          </Button>
        )}
        {sessionId && (
          <Button variant="outlined" color="secondary" onClick={resetSession}>
            Home
          </Button>
        )}
      </Stack>

      {/* Conversation */}
      {sessionId && (
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 700, maxHeight: 600, overflowY: "auto" }}>
          {conversation.map((msg, idx) => {
            if (msg.role === "finalDesign") {
              return (
                <Box key={idx} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "grey.100", width: "100%" }} elevation={2}>
                    <Box sx={{ width: "100%", aspectRatio: "3/2", overflow: "hidden", borderRadius: 2 }}>
                      <img
                        src={msg.diagram_url ?? "https://via.placeholder.com/600x400"}
                        alt="Generated system design diagram"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Button variant="contained" color="primary" onClick={() => downloadDiagram(msg.diagram_url!)}>
                        Download Diagram
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              );
            }

            return (
              <Box key={idx} sx={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <Stack spacing={0.5} alignItems={msg.role === "user" ? "flex-end" : "flex-start"}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                    {msg.role}
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: msg.role === "user" ? "primary.main" : "grey.300",
                      color: msg.role === "user" ? "primary.contrastText" : "text.primary",
                      borderTopRightRadius: msg.role === "user" ? 0 : 8,
                      borderTopLeftRadius: msg.role === "architai" ? 0 : 8,
                      maxWidth: 400,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </Box>
                </Stack>
              </Box>
            );
          })}

          {typing && (
            <Typography variant="body2" color="text.secondary">
              ArchitAI is typing...
            </Typography>
          )}

          <AnswerInput onSubmit={answerQuestion} loading={loading} />
          <div ref={conversationEndRef} />
        </Stack>
      )}
    </Container>
  );
};

// -------------------------
// Answer Input Component
// -------------------------
const AnswerInput: FC<{ onSubmit: (answer: string) => void; loading: boolean }> = ({ onSubmit, loading }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
    setAnswer("");
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        multiline
        minRows={2}
        placeholder="Your answer..."
        variant="outlined"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Send"}
      </Button>
    </Stack>
  );
};

export default AppPage;
