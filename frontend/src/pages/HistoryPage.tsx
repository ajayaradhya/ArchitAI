import { Container, Typography, Paper, Stack } from "@mui/material";

// Replace with actual API fetch of session history
const dummyHistory = [
  { id: 1, title: "E-commerce System", date: "2025-09-22" },
  { id: 2, title: "Social Media Platform", date: "2025-09-20" },
];

const HistoryPage = () => (
  <Container sx={{ py: 6 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>Session History</Typography>
    <Stack spacing={2}>
      {dummyHistory.map((s) => (
        <Paper key={s.id} sx={{ p: 2 }}>
          <Typography variant="h6">{s.title}</Typography>
          <Typography variant="body2" color="text.secondary">{s.date}</Typography>
        </Paper>
      ))}
    </Stack>
  </Container>
);

export default HistoryPage;
