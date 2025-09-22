import { useState, useEffect } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import type { SessionReplyResponse, FinalizeResponse } from "../api/api";
import api from "../api/api";
import QuestionForm from "../components/QuestionForm";

const SessionDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [finalDesign, setFinalDesign] = useState<FinalizeResponse | null>(null);

  // Fetch session details from backend
  useEffect(() => {
    // TODO: GET /session/{id}
    setQuestions(["How many active users?"]);
    setStatus("in_progress");
  }, [id]);

  const handleSubmitAnswer = async (answer: string) => {
    // Call POST /session/{id}/reply
    const res = await api.post<SessionReplyResponse>(`/session/${id}/reply`, { answer });
    setQuestions(res.data.next_questions);
    setStatus(res.data.status);
  };

  const handleFinalize = async () => {
    const res = await api.post<FinalizeResponse>(`/session/${id}/finalize`);
    setFinalDesign(res.data);
  };

  return (
    <div>
      <h1>Session {id}</h1>
      {questions.length > 0 && <QuestionForm question={questions[0]} onSubmit={handleSubmitAnswer} />}
      {status === "ready_to_finalize" && <button onClick={handleFinalize}>Finalize</button>}
      {finalDesign && (
        <div>
          <h2>Final Design</h2>
          <pre>{JSON.stringify(finalDesign, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
