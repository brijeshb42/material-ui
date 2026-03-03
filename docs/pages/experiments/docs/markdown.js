import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './markdown.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
