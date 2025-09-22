import { Container, Typography, TextField, Button, Stack } from "@mui/material";

const ContactPage = () => (
  <Container sx={{ py: 6 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>Contact Us</Typography>
    <Stack spacing={2} sx={{ maxWidth: 600 }}>
      <TextField label="Name" fullWidth />
      <TextField label="Email" fullWidth />
      <TextField label="Message" multiline rows={4} fullWidth />
      <Button variant="contained" color="primary">Send Message</Button>
    </Stack>
  </Container>
);

export default ContactPage;
