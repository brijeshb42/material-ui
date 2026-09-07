import * as React from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * Demonstrates https://github.com/mui/material-ui/issues/48009
 *
 * Released @mui/material: supplying slotProps.paper.ref overwrites the internal
 * paper ref, so the first swipe touch throws:
 *   TypeError: Cannot read properties of undefined (reading 'contains')
 *
 * Fixed workspace / pkg.pr.new build: external + internal refs are composed,
 * swipe-to-close works and no error is thrown.
 */
export default function App() {
  const [open, setOpen] = React.useState(true);
  const [crash, setCrash] = React.useState<string | null>(null);
  const [swipeResult, setSwipeResult] = React.useState<string>('Not run yet');
  const [paperAttached, setPaperAttached] = React.useState(false);
  const paperRef = React.useRef<HTMLDivElement | null>(null);

  const setPaperRef = React.useCallback((element: HTMLDivElement | null) => {
    paperRef.current = element;
    setPaperAttached(element != null);
  }, []);

  React.useEffect(() => {
    const onError = (event: ErrorEvent) => {
      setCrash(event.message);
    };
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  const runSyntheticSwipe = React.useCallback(() => {
    setCrash(null);
    setSwipeResult('Running…');
    const target = paperRef.current;
    if (!target) {
      setSwipeResult('Paper ref was not attached');
      return;
    }

    // Access constructors via bracket notation so browsers without Touch still
    // load this demo; real swipe on a touch device is the primary path.
    const win = window as Window &
      typeof globalThis & {
        Touch?: new (init: Record<string, unknown>) => unknown;
        TouchEvent?: new (type: string, init: Record<string, unknown>) => Event;
      };
    const TouchCtor = win.Touch;
    const TouchEventCtor = win.TouchEvent;
    if (typeof TouchCtor !== 'function' || typeof TouchEventCtor !== 'function') {
      setSwipeResult('Touch events are not supported in this browser; swipe the drawer manually');
      return;
    }

    const fire = (type: 'touchstart' | 'touchmove' | 'touchend', pageX: number) => {
      const touch = new TouchCtor({
        identifier: 0,
        target,
        pageX,
        clientX: pageX,
        pageY: 0,
        clientY: 0,
      });
      target.dispatchEvent(
        new TouchEventCtor(type, {
          bubbles: true,
          cancelable: true,
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
        }),
      );
    };

    try {
      fire('touchstart', 200);
      fire('touchmove', 180);
      fire('touchmove', 10);
      fire('touchend', 10);
      setSwipeResult(
        'Synthetic swipe completed without a throw (drawer should close if fix is present)',
      );
    } catch (error) {
      setCrash(error instanceof Error ? error.message : String(error));
      setSwipeResult('Synthetic swipe threw synchronously');
    }
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h5">
          SwipeableDrawer paper ref composition
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This preview passes a ref through <code>slotProps.paper</code>. On the released package,
          swiping crashes because the internal paper ref is overwritten. With the fixed package,
          both refs receive the paper node and swipe-to-close works.
        </Typography>

        {crash ? (
          <Alert severity="error">Crash (bug present): {crash}</Alert>
        ) : (
          <Alert severity="info">
            No crash recorded yet. Open the drawer and swipe left, or run the synthetic swipe.
          </Alert>
        )}

        <Alert severity={open ? 'warning' : 'success'}>
          Drawer is {open ? 'open' : 'closed'}. External paper ref attached:{' '}
          {paperAttached ? 'yes' : 'no'}.
        </Alert>

        <Typography variant="body2">Synthetic swipe: {swipeResult}</Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Open drawer
          </Button>
          <Button variant="outlined" onClick={runSyntheticSwipe} disabled={!open}>
            Run synthetic swipe-to-close
          </Button>
        </Stack>

        <SwipeableDrawer
          anchor="left"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          slotProps={{
            paper: {
              ref: setPaperRef,
              sx: { width: 280, p: 2 },
            },
          }}
        >
          <div>
            <Typography gutterBottom>Swipe left to close</Typography>
            <Typography variant="body2" color="text.secondary">
              If the bug is present, the first touch throws{' '}
              <code>Cannot read properties of undefined (reading &apos;contains&apos;)</code>.
            </Typography>
            <Button sx={{ mt: 2 }} onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </SwipeableDrawer>
      </Stack>
    </Container>
  );
}
