import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/components/card/card.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
