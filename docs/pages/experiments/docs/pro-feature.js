import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from './pro-feature.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
