import { useState } from "react";
import SystemIdeaPrompt from "../components/SystemIdeaPrompt";
import ConversationWindow from "../components/ConversationWindow";
import AnswerInput from "../components/AnswerInput";
import FinalDesignView from "../components/FinalDesignView"; // ✅ Import FinalDesignView
import api from "../api/api";

type ConversationMessage = {
  role: "user" | "architai" | "finalDesign";
  text?: string;
  diagram_url?: string;
};

const AppPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [finalDesign, setFinalDesign] = useState<any | null>(null);

  // -------------------
  // Start session
  // -------------------
  const submitPrompt = async (prompt: string) => {
    setLoading(true);
    setTyping(true);
    try {
      const res = await api.post("/session", { prompt });
      const session_id = res.data.session_id;
      setSessionId(session_id);

      const initialQuestions: string[] = res.data.questions || [];
      setQuestions(initialQuestions);

      const firstQ = initialQuestions[0] || null;
      setCurrentQuestion(firstQ);

      setConversation(
        [
          { role: "user" as const, text: prompt },
          ...(firstQ ? [{ role: "architai" as const, text: firstQ }] : [])
        ]
      );

    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  // -------------------
  // Answer current question
  // -------------------
  const answerQuestion = async (answer: string) => {
    if (!sessionId || !currentQuestion) return;
    setLoading(true);
    setTyping(true);

    try {
      // Append user's answer immediately
      setConversation((prev) => [...prev, { role: "user", text: answer }]);

      // Send reply to backend
      const res = await api.post(`/session/${sessionId}/reply`, {
        answers: [{ question: currentQuestion, answer }],
      });

      // Append ArchiTai's responses from backend
      const updatedConversation: ConversationMessage[] =
        res.data.conversation.map((msg: any) => ({
          role: msg.role as "user" | "architai" | "finalDesign",
          text: msg.text,
          diagram_url: msg.diagram_url,
        }));
      setConversation(updatedConversation);

      // Set next question ONLY from next_questions array
      const nextQ = res.data.next_questions[0] || null;
      setCurrentQuestion(nextQ);

      // If no more questions → finalize
      if (!nextQ && res.data.status === "ready_to_finalize") {
        const finalRes = await api.post(`/session/${sessionId}/finalize`);
        setFinalDesign(finalRes.data); // ✅ structured final design
        setCurrentQuestion(null);
      }
    } catch (err) {
      console.error("Failed to answer question:", err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  // -------------------
  // Download diagram
  // -------------------
  const downloadDiagram = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "system_design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------
  // Render
  // -------------------
  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-8 min-h-screen">
      {!sessionId ? (
        <div className="flex justify-center">
          <SystemIdeaPrompt onSubmit={submitPrompt} loading={loading} />
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!finalDesign ? (
              <ConversationWindow
                conversation={conversation}
                typing={typing}
                onDownload={downloadDiagram}
              />
            ) : (
              <FinalDesignView design={finalDesign} />
            )}
          </div>

          {currentQuestion ? (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="mb-2 font-medium text-gray-700">
                {currentQuestion}
              </p>
              <AnswerInput onSubmit={answerQuestion} loading={loading} />
            </div>
          ) : !finalDesign ? (
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-gray-600">
              <p>
                System design generated above. You can download it by clicking
                the download button.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AppPage;
