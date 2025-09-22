import { useState, useRef, useEffect, FC } from "react";
import api from "./api/api";
import type { SessionCreateResponse, SessionReplyResponse, FinalizeResponse } from "./api/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";

// -------------------------
// App Component
// -------------------------
const App: FC = () => {
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

  // Dynamic page title
  useEffect(() => {
    if (conversation.find((c) => c.role === "finalDesign")) {
      document.title = "Final Design – ArchitAI";
    } else if (sessionId) {
      document.title = "Conversation – ArchitAI";
    } else {
      document.title = "ArchitAI";
    }
  }, [sessionId, conversation]);

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
      const newConversation = [
        { role: "user", text: prompt },
        ...(firstQuestion ? [{ role: "architai", text: firstQuestion }] : []),
      ];
      setConversation(newConversation);
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

  const resetApp = () => {
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", color: "text.primary" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          py: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700}>ArchitAI</Typography>
          <Button variant="outlined" color="primary" onClick={resetApp}>Home</Button>
        </Container>
      </Box>

      {/* Main */}
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Initial Prompt */}
        {!sessionId && (
          <Paper sx={{ p: 4, maxWidth: 700, width: "100%" }} elevation={3}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter a system design idea and ArchitAI will guide you through a conversation to generate the final diagram.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                variant="outlined"
                placeholder="Describe your system design"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startSession(); } }}
              />
              <Button variant="contained" color="primary" onClick={startSession} disabled={loading} sx={{ minWidth: 140 }}>
                {loading ? <CircularProgress size={24} /> : "Generate"}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Conversation */}
        {sessionId && (
          <Stack spacing={2} sx={{ width: "100%", maxWidth: 700, maxHeight: 600, overflowY: "auto", mt: 4 }}>
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
    </Box>
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

export default App;
