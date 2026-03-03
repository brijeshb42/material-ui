import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/getting-started/overview/overview.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} disableAd />;
}
