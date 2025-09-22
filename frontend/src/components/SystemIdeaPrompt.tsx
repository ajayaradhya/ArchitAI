import { useState } from "react";

interface Props {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
}

const steps = [
  { id: 1, question: "Which domain is your system in?", placeholder: "e.g., Healthcare, Travel, Finance..." },
  { id: 2, question: "What main problem should it solve?", placeholder: "e.g., Booking tickets, Managing records..." },
  { id: 3, question: "Any special requirements or features?", placeholder: "e.g., AI integration, multi-user login..." },
];

const SystemIdeaPrompt: React.FC<Props> = ({ onSubmit, loading }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(steps.length).fill(""));
  const [finalPrompt, setFinalPrompt] = useState("");

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // build combined prompt
      const combined = answers.join(". ") + (finalPrompt ? `. ${finalPrompt}` : "");
      onSubmit(combined.trim());
    }
  };

  const handleChange = (val: string) => {
    if (step < steps.length) {
      const newAnswers = [...answers];
      newAnswers[step] = val;
      setAnswers(newAnswers);
    } else {
      setFinalPrompt(val);
    }
  };

  const totalSteps = steps.length + 1; // extra step for final refinement
  const progressPercent = ((step + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center animate-fadeIn space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-indigo-600 h-2 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">{`Step ${step + 1} of ${totalSteps}`}</p>

      {step < steps.length ? (
        <>
          <h2 className="text-xl font-bold text-center text-gray-800">
            {steps[step].question}
          </h2>
          <input
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder={steps[step].placeholder}
            value={answers[step]}
            onChange={(e) => handleChange(e.target.value)}
          />
          <button
            className={`mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow transition-all ${
              !answers[step].trim() || loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
            }`}
            onClick={handleNext}
            disabled={!answers[step].trim() || loading}
          >
            {step === steps.length - 1 ? "Continue to Prompt" : "Next"}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-center text-gray-800">
            Final Step: Refine your idea
          </h2>
          <textarea
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            rows={3}
            placeholder="Add any extra details or refine your idea..."
            value={finalPrompt}
            onChange={(e) => handleChange(e.target.value)}
          />
          <button
            className={`mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow transition-all ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
            }`}
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "Loading..." : "Start Building"}
          </button>
        </>
      )}
    </div>
  );
};

export default SystemIdeaPrompt;
