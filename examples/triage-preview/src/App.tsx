import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';

export default function App() {
  const [open, setOpen] = React.useState(false);
  // External ref passed via slotProps.paper — previously overwrote the
  // internal paperRef, leaving it null and crashing all touch handlers.
  const externalPaperRef = React.useRef<HTMLDivElement>(null);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          SwipeableDrawer — external paper ref (issue #48009)
        </Typography>
        <Alert severity="success">
          Both the internal <code>paperRef</code> and the external ref now receive the paper
          element. Swipe-to-close no longer crashes when{' '}
          <code>{'slotProps={{ paper: { ref } }}'}</code> is supplied.
        </Alert>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Typography variant="body2" color="text.secondary">
          External ref attached:{' '}
          <strong>{open && externalPaperRef.current ? 'yes ✓' : 'no (drawer closed)'}</strong>
        </Typography>
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          slotProps={{ paper: { ref: externalPaperRef } }}
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Swipe down to close
            </Typography>
            <Typography>
              This drawer passes an external <code>ref</code> through{' '}
              <code>slotProps.paper</code>. Swipe down — previously this crashed with{' '}
              <em>Cannot read properties of undefined (reading &apos;contains&apos;)</em>.
            </Typography>
          </Box>
        </SwipeableDrawer>
      </Stack>
    </Container>
  );
}
