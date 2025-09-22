// import { useRef, useEffect } from "react";
import MessageBubble from "../components/MessageBubble";

// Reuse the same type as in AppPage
export type ConversationMessage = {
  role: "user" | "architai" | "finalDesign";
  text?: string;
  diagram_url?: string;
};

interface Props {
  conversation: ConversationMessage[];
  typing: boolean;
  onDownload?: (url: string) => void;
}

const ConversationWindow: React.FC<Props> = ({
  conversation,
  typing,
  onDownload,
}) => {
//   const endRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (conversation.length > 0) {
//       endRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [conversation, typing]);

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto p-4">
      {conversation.map((msg, idx) => (
        <MessageBubble key={idx} {...msg} onDownload={onDownload} />
      ))}

      {typing && (
        <div className="self-start text-indigo-500 italic animate-pulse">
          ArchitAI is typing...
        </div>
      )}
{/* 
      <div ref={endRef} /> */}
    </div>
  );
};

export default ConversationWindow;
