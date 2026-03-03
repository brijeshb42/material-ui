import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/data/system/components/stack/stack.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
