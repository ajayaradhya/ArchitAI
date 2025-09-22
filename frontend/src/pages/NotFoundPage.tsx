import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Container sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="h2" gutterBottom>404</Typography>
      <Typography variant="h6" gutterBottom>Page not found.</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/")}>Go Home</Button>
    </Container>
  );
};

export default NotFoundPage;
