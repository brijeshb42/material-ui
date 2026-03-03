import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './headers.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
