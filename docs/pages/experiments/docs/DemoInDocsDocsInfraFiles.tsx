import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import notesData from '../../../data/experiments/docs-infra/notesData';

export default function DemoInDocsDocsInfraFiles() {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      {notesData.map((note) => (
        <Alert key={note.severity} severity={note.severity}>
          {note.message}
        </Alert>
      ))}
    </Stack>
  );
}
