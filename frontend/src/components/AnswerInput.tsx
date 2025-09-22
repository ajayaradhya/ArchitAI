import { useState } from "react";

interface Props {
  onSubmit: (answer: string) => void;
  loading?: boolean;
}

const AnswerInput: React.FC<Props> = ({ onSubmit, loading }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
    setAnswer("");
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-2 mt-4">
      <textarea
        className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        rows={1}
        placeholder="Ask a follow-up or comment..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
      />
      <button
        className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-all"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default AnswerInput;
