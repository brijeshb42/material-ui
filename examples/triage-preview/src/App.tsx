import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';

export default function App() {
  const [open, setOpen] = React.useState(false);
  const externalPaperRef = React.useRef<HTMLDivElement>(null);
  const [refStatus, setRefStatus] = React.useState<string>('not mounted yet');

  React.useEffect(() => {
    if (open) {
      setRefStatus(
        externalPaperRef.current
          ? `✅ ref.current = <${externalPaperRef.current.tagName.toLowerCase()}> (populated correctly)`
          : '❌ ref.current is null (bug: internal ref was overwritten)',
      );
    }
  }, [open]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          SwipeableDrawer — external ref fix
        </Typography>

        <Alert severity="success">
          <strong>Fix:</strong> <code>mergeSlotProps</code> now composes refs when both the
          internal and external slot props carry a <code>ref</code>, so the internal{' '}
          <code>paperRef</code> is no longer silently overwritten by a user-supplied{' '}
          <code>slotProps.paper.ref</code>.
        </Alert>

        <Alert severity="info">
          Open the drawer and swipe to close it. Before the fix, any touch handler that accessed{' '}
          <code>paperRef.current</code> would crash with{' '}
          <em>TypeError: Cannot read properties of undefined</em>.
        </Alert>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Open SwipeableDrawer (with external ref)
        </Button>

        <Divider />

        <Typography variant="body2" color="text.secondary">
          External ref status (after open): <code>{refStatus}</code>
        </Typography>
      </Stack>

      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            ref: externalPaperRef,
            sx: { borderRadius: '12px 12px 0 0', p: 3 },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Swipe down to close</Typography>
          <Typography variant="body2" color="text.secondary">
            The external <code>ref</code> passed via <code>slotProps.paper.ref</code> and the
            internal <code>paperRef</code> used by swipe handlers are both populated — no crash.
          </Typography>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Box>
      </SwipeableDrawer>
    </Container>
  );
}
