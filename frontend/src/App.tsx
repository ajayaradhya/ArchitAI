import { useState, useEffect } from "react";
import type { FC } from "react";
import api from "./api/api";
import type { 
  SessionCreateResponse, 
  SessionReplyResponse, 
  FinalizeResponse 
} from "./api/api";

const App: FC = () => {
  const [prompt, setPrompt] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [conversation, setConversation] = useState<{role: "user"|"architai", text: string}[]>([]);
  const [finalDesign, setFinalDesign] = useState<FinalizeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await api.post<SessionCreateResponse>("/session", { prompt });
      setSessionId(res.data.session_id);
      setQuestions(res.data.questions);
      setConversation([{ role: "user", text: prompt }]);
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = async (answer: string) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await api.post<SessionReplyResponse>(`/session/${sessionId}/reply`, { answer });
      const nextQs = res.data.next_questions;

      // Add ArchitAI question & user answer to conversation
      setConversation(prev => [
        ...prev,
        { role: "architai", text: questions[0] },
        { role: "user", text: answer }
      ]);

      setQuestions(nextQs);
      if (res.data.status === "ready_to_finalize") {
        const finalRes = await api.post<FinalizeResponse>(`/session/${sessionId}/finalize`);
        setFinalDesign(finalRes.data);
      }
    } catch (err) {
      console.error("Failed to answer question:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 flex flex-col">
      <header className="bg-background-light/80 dark:bg-background-dark/80 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">ArchitAI</h1>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        {!sessionId && !finalDesign && (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Enter a system design idea and ArchitAI will guide you through a conversation to generate the final diagram.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe your system design"
                className="flex-1 rounded-lg border-none bg-white/90 dark:bg-background-dark/90 focus:ring-2 focus:ring-primary p-3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90"
                onClick={startSession}
                disabled={loading}
              >
                {loading ? "Starting..." : "Generate"}
              </button>
            </div>
          </div>
        )}

        {sessionId && !finalDesign && (
          <div className="mt-8 space-y-4">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "architai" && (
                  <div className="bg-gray-200 dark:bg-gray-700/50 p-3 rounded-lg rounded-tl-none max-w-xs">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{msg.text}</p>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="bg-primary text-white p-3 rounded-lg rounded-tr-none max-w-xs">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}

            {questions.length > 0 && (
              <AnswerInput onSubmit={answerQuestion} loading={loading} />
            )}
          </div>
        )}

        {finalDesign && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Final Design</h2>
            <div className="bg-gray-100 dark:bg-background-dark/50 rounded-xl p-4">
              <pre className="whitespace-pre-wrap">{JSON.stringify(finalDesign, null, 2)}</pre>
            </div>
            <button className="bg-primary text-white font-bold text-base py-3 px-8 rounded-lg hover:bg-primary/90 mt-4 inline-flex items-center gap-2">
              Download Diagram
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// -------------------------
// Answer input component
// -------------------------
const AnswerInput: FC<{ onSubmit: (answer: string) => void; loading: boolean }> = ({ onSubmit, loading }) => {
  const [answer, setAnswer] = useState("");
  const handleSubmit = () => {
    if (!answer) return;
    onSubmit(answer);
    setAnswer("");
  };
  return (
    <div className="flex gap-2 mt-4">
      <input
        type="text"
        placeholder="Your answer..."
        className="flex-1 rounded-lg border-none bg-white/90 dark:bg-background-dark/90 focus:ring-2 focus:ring-primary p-3"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button
        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Send"}
      </button>
    </div>
  );
};

export default App;
