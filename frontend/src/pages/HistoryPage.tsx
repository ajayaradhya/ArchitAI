import { useEffect, useState } from "react";
import api from "../api/api";
import ConversationWindow, { type ConversationMessage } from "../components/ConversationWindow";

interface Session {
  id: string;
  title: string;
  created_at: string;
  conversation?: {
    role: string;
    text: string;
    diagram_url?: string;
  }[];
}

interface Msg {
  role: "user" | "architai" | "finalDesign";
  text?: string;
  diagram_url?: string;
}

const HistoryPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Msg[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch all sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/session");
        const sessionsData = (res.data || []).map((s: any) => ({
            id: s.session_id,
            title: s.questions && s.questions.length > 0 ? s.questions[0] : `Session ${s.session_id.slice(0, 6)}`,
            created_at: s.created_at,
            conversation: s.conversation || [],
            }));
        setSessions(sessionsData);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Fetch session details when a session is selected
  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchSessionDetails = async () => {
  if (!selectedSessionId) return;

  setDetailLoading(true);
  try {
    // Find the session locally from the sessions array
    const selectedSession = sessions.find((s) => s.id === selectedSessionId);

    if (!selectedSession) {
      setConversation([]);
      return;
    }

    // Map backend conversation to frontend type
    const conv: ConversationMessage[] = (selectedSession.conversation || []).map((msg: any) => ({
    role:
        msg.role?.toLowerCase() === "architai"
        ? "architai"
        : msg.role?.toLowerCase() === "finaldesign"
        ? "finalDesign"
        : "user",
    text: msg.text,
    diagram_url: msg.diagram_url,
    }));

    setConversation(conv);
  } catch (err) {
    console.error("Error fetching session details:", err);
    setConversation([]);
  } finally {
    setDetailLoading(false);
  }
};


    fetchSessionDetails();
  }, [selectedSessionId]);

  return (
    <div className="flex flex-col h-screen px-6 py-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Session History</h2>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center mt-6">
              <div className="loader"></div>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500 mt-6">No sessions found. Start a new session to see it here.</p>
          ) : (
            <div className="flex flex-col space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all
                    ${selectedSessionId === s.id ? "bg-indigo-100" : "bg-white hover:bg-gray-100"}`}
                >
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="flex-1 overflow-y-auto p-2">
          {detailLoading && <p className="text-gray-500">Loading session...</p>}

          {!detailLoading && !selectedSessionId && sessions.length > 0 && (
            <p className="text-gray-500 mt-6">Select a session to view details</p>
          )}

          {!detailLoading && selectedSessionId && conversation.length === 0 && (
            <p className="text-gray-500 mt-6">No conversation found for this session.</p>
          )}

          {!detailLoading && conversation.length > 0 && (
            <ConversationWindow conversation={conversation} typing={false} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
