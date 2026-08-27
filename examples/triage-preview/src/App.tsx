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
  const [refStatus, setRefStatus] = React.useState<string>('drawer not opened yet');

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      setRefStatus(
        externalPaperRef.current
          ? `✅ externalPaperRef.current = <${externalPaperRef.current.tagName.toLowerCase()} class="${externalPaperRef.current.className.split(' ')[0]}">`
          : '❌ externalPaperRef.current is null (bug: ref overwritten)',
      );
    }, 50);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography component="h1" variant="h5">
          SwipeableDrawer — external paper ref fix
        </Typography>

        <Alert severity="info">
          Issue: when a ref was passed via{' '}
          <code>{'slotProps={{ paper: { ref } }}'}</code>, the internal{' '}
          <code>paperRef</code> used by swipe handlers was overwritten, causing a crash on swipe.
          The fix composes both refs so each receives the paper element.
        </Alert>

        <Box>
          <Button variant="contained" onClick={handleOpen}>
            Open drawer (with external paper ref)
          </Button>
        </Box>

        <Alert severity={refStatus.startsWith('✅') ? 'success' : 'warning'} variant="outlined">
          <Typography variant="body2" component="pre" sx={{ m: 0, fontFamily: 'monospace' }}>
            {refStatus}
          </Typography>
        </Alert>

        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onOpen={handleOpen}
          onClose={handleClose}
          slotProps={{
            paper: {
              ref: externalPaperRef,
              sx: { borderRadius: '12px 12px 0 0', p: 3 },
            },
          }}
        >
          <Stack spacing={2} sx={{ pb: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: 'grey.400',
                borderRadius: 2,
                mb: 1,
              }}
            />
            <Typography variant="h6">Swipe down to close</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              The external <code>ref</code> and the internal swipe <code>paperRef</code> are now
              both filled via ref composition in <code>mergeSlotProps</code>.
            </Typography>
            <Button onClick={handleClose}>Close</Button>
          </Stack>
        </SwipeableDrawer>
      </Stack>
    </Container>
  );
}
