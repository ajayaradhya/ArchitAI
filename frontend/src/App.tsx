import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SessionsList from "./pages/SessionsList";
import SessionDetail from "./pages/SessionDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SessionsList />} />
        <Route path="/session/:id" element={<SessionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
