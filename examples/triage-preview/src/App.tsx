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
  const externalPaperRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography component="h1" variant="h5">
          SwipeableDrawer – external ref via <code>slotProps.paper.ref</code>
        </Typography>

        <Alert severity="info">
          <strong>The bug (released @mui/material):</strong> When a <code>ref</code> is passed via{' '}
          <code>slotProps.paper</code>, <code>mergeSlotProps</code> overwrites the internal{' '}
          <code>paperRef</code> used by every swipe handler. Any swipe gesture crashes with:
          <br />
          <code>
            TypeError: Cannot read properties of undefined (reading &apos;contains&apos;)
          </code>
        </Alert>

        <Alert severity="success">
          <strong>The fix:</strong> <code>mergeSlotProps</code> now composes both refs into a
          single callback ref so the internal paperRef and the external ref both receive the paper
          element. Swiping works normally.
        </Alert>

        <Alert severity="warning">
          <strong>How to observe the difference</strong>
          <ol style={{ margin: '8px 0 0', paddingLeft: '1.2em' }}>
            <li>Open the drawer below.</li>
            <li>Enable touch emulation in DevTools (F12 → Toggle device toolbar).</li>
            <li>Swipe the drawer downward to close it.</li>
            <li>
              <strong>Released package:</strong> crash with <code>TypeError</code>.{' '}
              <strong>Fixed package:</strong> drawer closes normally.
            </li>
          </ol>
        </Alert>

        <Button variant="contained" onClick={() => setOpen(true)} sx={{ alignSelf: 'flex-start' }}>
          Open Drawer
        </Button>

        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          slotProps={{
            paper: {
              // External ref – this caused paperRef.current to be null in the released package
              ref: externalPaperRef,
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Swipe down (touch emulation) to close
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Released package: swipe crashes. Fixed package: swipe closes the drawer.
            </Typography>
            <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
              Close (button)
            </Button>
          </Box>
        </SwipeableDrawer>
      </Stack>
    </Container>
  );
}
