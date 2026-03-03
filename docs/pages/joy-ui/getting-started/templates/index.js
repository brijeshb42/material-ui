import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/getting-started/templates/index.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} disableToc />;
}
