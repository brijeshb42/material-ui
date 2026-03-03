import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/components/badge/badge.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
