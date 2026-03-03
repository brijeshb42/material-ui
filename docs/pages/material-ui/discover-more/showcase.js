import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/material/discover-more/showcase/showcase.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} disableToc />;
}
