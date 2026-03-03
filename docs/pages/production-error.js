import MarkdownDocs from '@mui/docs/MarkdownDocs';
import * as pageProps from 'docs/src/pages/production-error/index.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} disableAd />;
}
