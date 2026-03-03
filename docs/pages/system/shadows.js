import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/system/shadows/shadows.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
