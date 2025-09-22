import { useState } from "react";
import type { FC } from "react";


interface Props {
  question: string;
  onSubmit: (answer: string) => void;
}

const QuestionForm: FC<Props> = ({ question, onSubmit }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>{question}</p>
      <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default QuestionForm;
