import { useState } from "react";
import SystemIdeaPrompt from "../components/SystemIdeaPrompt";
import ConversationWindow from "../components/ConversationWindow";
import AnswerInput from "../components/AnswerInput";
import api from "../api/api";

// -------------------------
// Types
// -------------------------
type ConversationMessage = {
  role: "user" | "architai" | "finalDesign";
  text?: string;
  diagram_url?: string;
};

// -------------------------
// Component
// -------------------------
const AppPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // Start a new guided session
  const startSession = async (idea: string) => {
    setLoading(true);
    setTyping(true);

    try {
      const res = await api.post("/session", { prompt: idea });
      setSessionId(res.data.session_id);

      const firstQ: string | undefined = res.data.questions[0];

      const initialConversation: ConversationMessage[] = [
        { role: "user", text: idea },
      ];

      if (firstQ) {
        initialConversation.push({ role: "architai", text: firstQ });
      }

      setConversation(initialConversation);
      setQuestions(res.data.questions.slice(1));
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  // Answer the current question
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
        const res = await api.post(`/session/${sessionId}/reply`, { answer });

        if (res.data.next_questions.length > 0) {
          const nextQ = res.data.next_questions[0];
          setConversation((prev) => [...prev, { role: "architai", text: nextQ }]);
          setQuestions(res.data.next_questions.slice(1));
        }

        if (res.data.status === "ready_to_finalize") {
          const finalRes = await api.post(`/session/${sessionId}/finalize`);
          setConversation((prev) => [
            ...prev,
            { role: "finalDesign", diagram_url: finalRes.data.diagram_url },
          ]);
        }
      }
    } catch (err) {
      console.error("Error answering question:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  // Download final diagram
  const downloadDiagram = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "system_design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-8 min-h-screen">
        {/* 1️⃣ System Idea Prompt or Chat Window */}
        {!sessionId ? (
        <div className="flex justify-center">
            <SystemIdeaPrompt onSubmit={startSession} loading={loading} />
        </div>
        ) : (
        <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-xl shadow-md border border-gray-200">
            {/* 2️⃣ Conversation Window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <ConversationWindow
                conversation={conversation}
                typing={typing}
                onDownload={downloadDiagram}
            />
            </div>

            {/* 3️⃣ Input Box */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
            <AnswerInput onSubmit={answerQuestion} loading={loading} />
            </div>
        </div>
        )}
    </div>
    );

};

export default AppPage;
