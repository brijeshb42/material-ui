import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/material/guides/testing/testing.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
