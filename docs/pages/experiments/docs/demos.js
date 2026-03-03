import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './demos.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
