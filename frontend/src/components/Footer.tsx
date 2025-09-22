import { Box, Typography, Link } from "@mui/material";

const Footer = () => (
  <Box sx={{ bgcolor: "background.paper", py: 3, mt: 4, textAlign: "center" }}>
    <Typography variant="body2" color="text.secondary">
      © {new Date().getFullYear()} ArchitAI. All rights reserved. | 
      <Link href="/about" sx={{ ml: 1 }}>About</Link>
    </Typography>
  </Box>
);

export default Footer;
