import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './custom-components.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
