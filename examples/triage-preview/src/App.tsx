import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function App() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          Material UI triage preview
        </Typography>
        <Alert severity="info">
          This baseline is replaced with a focused demonstration when automated triage proposes a
          fix.
        </Alert>
      </Stack>
    </Container>
  );
}
