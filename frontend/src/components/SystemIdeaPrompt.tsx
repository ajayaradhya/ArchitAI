import { useState } from "react";

interface Props {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
}

const SystemIdeaPrompt: React.FC<Props> = ({ onSubmit, loading }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center animate-fadeIn space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Describe your system idea
      </h2>
      <textarea
        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        rows={5}
        placeholder="Type your system idea here... e.g., Travel app with multi-user login"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className={`mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow transition-all ${
          !prompt.trim() || loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
        }`}
        onClick={handleSubmit}
        disabled={!prompt.trim() || loading}
      >
        {loading ? "Loading..." : "Generate Design"}
      </button>
    </div>
  );
};

export default SystemIdeaPrompt;
