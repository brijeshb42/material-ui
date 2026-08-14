import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

const notes = [
  { severity: 'info', message: 'This demo loads its source through docs-infra.' },
  { severity: 'success', message: 'Its siblings still use the legacy pipeline.' },
];

export default function DemoInDocsDocsInfra() {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      {notes.map((note) => (
        <Alert key={note.severity} severity={note.severity}>
          {note.message}
        </Alert>
      ))}
    </Stack>
  );
}
