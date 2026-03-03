import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './codeblock.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
