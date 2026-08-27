import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';

export default function App() {
  const [open, setOpen] = React.useState(false);
  const externalPaperRef = React.useRef<HTMLDivElement>(null);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          SwipeableDrawer: external paper ref fix
        </Typography>
        <Alert severity="success">
          <strong>Fix:</strong> When a <code>ref</code> is supplied via{' '}
          <code>slotProps.paper.ref</code>, <code>mergeSlotProps</code> now composes both the
          internal and external refs. Swiping no longer crashes with{' '}
          <code>Cannot read properties of undefined (reading &apos;contains&apos;)</code>.
        </Alert>
        <Alert severity="info">
          Open the drawer, then swipe left to close it. With the fix the internal{' '}
          <code>paperRef</code> and the external ref both receive the paper element.
        </Alert>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Typography variant="body2" color="text.secondary">
          External ref attached:{' '}
          <strong>{open ? 'yes — ' + externalPaperRef.current?.tagName : 'drawer closed'}</strong>
        </Typography>
      </Stack>

      <SwipeableDrawer
        anchor="left"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            ref: externalPaperRef,
          },
        }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Swipe left to close
          </Typography>
          <List>
            {['Item 1', 'Item 2', 'Item 3'].map((text) => (
              <ListItem key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </Container>
  );
}
