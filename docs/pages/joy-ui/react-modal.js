import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/joy/components/modal/modal.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
