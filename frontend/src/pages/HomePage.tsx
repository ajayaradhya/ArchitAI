import { Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: "center", py: 10 }}>
      <Typography variant="h2" fontWeight={700} gutterBottom>
        Welcome to ArchitAI
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        Generate system design diagrams through guided AI conversation.
      </Typography>
      <Button variant="contained" color="primary" size="large" onClick={() => navigate("/app")}>
        Get Started
      </Button>
    </Container>
  );
};

export default HomePage;
