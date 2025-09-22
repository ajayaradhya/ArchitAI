interface Props {
  role: "user" | "architai" | "finalDesign";
  text?: string;
  diagram_url?: string;
  onDownload?: (url: string) => void;
}

const MessageBubble: React.FC<Props> = ({
  role,
  text,
  diagram_url,
  onDownload,
}) => {
  if (role === "finalDesign" && diagram_url) {
    return (
      <div className="self-center w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-5 shadow-xl animate-slideUp">
        <img
          src={diagram_url}
          alt="Generated Diagram"
          className="w-full rounded-xl object-cover"
        />
        {onDownload && (
          <button
            onClick={() => onDownload(diagram_url)}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
          >
            ⬇ Download Diagram
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm sm:text-base leading-relaxed animate-slideUp transition-all 
        ${
          role === "user"
            ? "self-end bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
            : "self-start bg-indigo-50 text-gray-900 border border-indigo-100"
        }`}
    >
      {text}
    </div>
  );
};

export default MessageBubble;
