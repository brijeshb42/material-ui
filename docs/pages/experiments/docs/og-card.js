import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './og-card.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
