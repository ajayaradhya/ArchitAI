import { useState, useEffect } from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import type { SessionCreateResponse } from "../api/api";


const SessionsList: FC = () => {
  const [sessions, setSessions] = useState<SessionCreateResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get<SessionCreateResponse[]>("/session");
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      <h1>Sessions</h1>
      {sessions.length === 0 && <p>No sessions yet</p>}
      {sessions.map((s) => (
        <div key={s.session_id}>
          <Link to={`/session/${s.session_id}`}>{s.session_id}</Link>
        </div>
      ))}
    </div>
  );
};

export default SessionsList;
