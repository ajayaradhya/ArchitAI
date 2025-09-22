import { Container, Typography } from "@mui/material";

const AboutPage = () => (
  <Container sx={{ py: 6 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>About ArchitAI</Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      ArchitAI is a tool to help developers and architects generate system design diagrams interactively.
    </Typography>
    <Typography variant="body1">
      Our AI guides you through questions, collects your input, and produces a final diagram you can download.
    </Typography>
  </Container>
);

export default AboutPage;
